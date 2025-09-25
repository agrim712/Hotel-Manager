import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import holidays
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import warnings
from decimal import Decimal
import json
import sqlite3
import os
from collections import defaultdict
warnings.filterwarnings('ignore')

class HotelDynamicPricingModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.room_type_encoder = LabelEncoder()
        self.db_path = os.path.join(os.path.dirname(__file__), 'pricing_data.db')
        self.init_database()
        
        # Base multipliers for different rate types
        self.rate_type_multipliers = {
            'EP': 1.0,  # Room Only
            'CP': 1.2,  # Breakfast
            'MAP': 1.4, # Breakfast + One Meal
            'AP': 1.6,  # Full Board
            'AI': 2.0   # All Inclusive
        }
        
        self.occasion_multipliers = {
            'New Year': 2.5,
            'Christmas': 2.2,
            'Valentine\'s Day': 1.8,
            'Easter': 1.6,
            'Independence Day': 1.7,
            'Thanksgiving': 1.9,
            'Labor Day': 1.5,
            'Memorial Day': 1.6,
            'Mother\'s Day': 1.4,
            'Father\'s Day': 1.3,
            'Halloween': 1.3,
            'Diwali': 1.8,
            'Eid': 1.7,
            'Chinese New Year': 1.9,
            'Weekend': 1.3,
            'Summer Peak': 1.4,
            'Winter Holiday': 1.6,
            'Spring Break': 1.7,
            'Conference Season': 1.5,
            'Wedding Season': 1.6,
            'Festival': 1.4,
            'Concert/Event': 1.8,
            'Sports Event': 1.9,
            'Convention': 1.6
        }
        
        # Initialize historical multipliers cache
        self.historical_multipliers = {}
        self.occupancy_data = {}
        
    def init_database(self):
        """Initialize SQLite database for storing multipliers and occupancy data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables for multipliers and occupancy tracking
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS multiplier_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    room_type TEXT NOT NULL,
                    rate_type TEXT NOT NULL,
                    multiplier REAL NOT NULL,
                    base_rate REAL NOT NULL,
                    dynamic_rate REAL NOT NULL,
                    occupancy_factor REAL NOT NULL,
                    demand_factor REAL NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date, room_type, rate_type)
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS occupancy_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    actual_occupancy REAL,
                    predicted_occupancy REAL,
                    total_rooms INTEGER,
                    occupied_rooms INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date)
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pricing_dependencies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_type TEXT NOT NULL,
                    rate_type TEXT NOT NULL,
                    dependency_type TEXT NOT NULL,
                    dependency_config TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Database initialization error: {e}")
    
    def get_holidays_and_occasions(self, date):
        """Get all holidays and special occasions for a given date"""
        occasions = []
        
        # US Holidays
        us_holidays = holidays.US(years=date.year)
        
        if date in us_holidays:
            holiday_name = us_holidays[date]
            occasions.append(holiday_name)
        
        # Weekend
        month = date.month
        day = date.day
        weekday = date.weekday()
        
        if weekday >= 5:  # Saturday=5, Sunday=6
            occasions.append('Weekend')
        
        # Seasonal occasions
        if month in [6, 7, 8]:
            occasions.append('Summer Peak')
        elif month in [12, 1]:
            occasions.append('Winter Holiday')
        elif month in [3, 4]:
            occasions.append('Spring Break')
        
        # Wedding season 
        if month >= 4 and month <= 10:
            occasions.append('Wedding Season')
        
        # Festival season 
        if month >= 10 or month <= 3:
            occasions.append('Festival')
        
        # Valentine's Day
        if month == 2 and day == 14:
            occasions.append('Valentine\'s Day')
        
        return occasions
    
    def get_historical_multiplier(self, date, room_type, rate_type):
        """Get historical multiplier for a specific date/room/rate combination"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Try to get exact date match first
            cursor.execute('''
                SELECT multiplier FROM multiplier_history 
                WHERE date = ? AND room_type = ? AND rate_type = ?
                ORDER BY created_at DESC LIMIT 1
            ''', (date.strftime('%Y-%m-%d'), room_type, rate_type))
            
            result = cursor.fetchone()
            if result:
                conn.close()
                return float(result[0])
            
            # If no exact match, try same day of week from previous weeks
            for weeks_back in [1, 2, 3, 4]:
                lookup_date = date - timedelta(weeks=weeks_back)
                cursor.execute('''
                    SELECT multiplier FROM multiplier_history 
                    WHERE date = ? AND room_type = ? AND rate_type = ?
                    ORDER BY created_at DESC LIMIT 1
                ''', (lookup_date.strftime('%Y-%m-%d'), room_type, rate_type))
                
                result = cursor.fetchone()
                if result:
                    conn.close()
                    return float(result[0])
            
            conn.close()
            return 1.0  # Default multiplier
            
        except Exception as e:
            print(f"Error getting historical multiplier: {e}")
            return 1.0
    
    def save_multiplier(self, date, room_type, rate_type, multiplier, base_rate, dynamic_rate, occupancy_factor, demand_factor):
        """Save multiplier data to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO multiplier_history 
                (date, room_type, rate_type, multiplier, base_rate, dynamic_rate, occupancy_factor, demand_factor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (date.strftime('%Y-%m-%d'), room_type, rate_type, multiplier, base_rate, dynamic_rate, occupancy_factor, demand_factor))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving multiplier: {e}")
    
    def calculate_occupancy_percentage(self, date, hotel_id=None):
        """Calculate actual occupancy percentage for a given date"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Try to get actual occupancy data
            cursor.execute('''
                SELECT actual_occupancy, occupied_rooms, total_rooms 
                FROM occupancy_data 
                WHERE date = ?
                ORDER BY created_at DESC LIMIT 1
            ''', (date.strftime('%Y-%m-%d'),))
            
            result = cursor.fetchone()
            if result and result[0] is not None:
                conn.close()
                return {
                    'occupancy_percentage': float(result[0]),
                    'occupied_rooms': int(result[1]) if result[1] else 0,
                    'total_rooms': int(result[2]) if result[2] else 100,
                    'source': 'actual'
                }
            
            conn.close()
            
            # If no actual data, calculate based on patterns and occasions
            base_occupancy = 0.65  # Base 65% occupancy
            
            # Adjust for day of week
            weekday = date.weekday()
            if weekday >= 5:  # Weekend
                base_occupancy += 0.15
            elif weekday >= 3:  # Thu-Fri
                base_occupancy += 0.05
            
            # Adjust for occasions
            occasions = self.get_holidays_and_occasions(date)
            if occasions:
                max_occasion_boost = max([self.occasion_multipliers.get(occ, 1.0) - 1.0 for occ in occasions])
                base_occupancy += max_occasion_boost * 0.2
            
            # Seasonal adjustments
            month = date.month
            if month in [6, 7, 8]:  # Summer
                base_occupancy += 0.1
            elif month in [12, 1]:  # Winter holidays
                base_occupancy += 0.15
            elif month in [3, 4]:  # Spring
                base_occupancy += 0.05
            
            # Ensure reasonable bounds
            occupancy_percentage = min(95.0, max(20.0, base_occupancy * 100))
            
            return {
                'occupancy_percentage': occupancy_percentage,
                'occupied_rooms': int(occupancy_percentage * 100 / 100),  # Assume 100 rooms
                'total_rooms': 100,
                'source': 'predicted',
                'factors': {
                    'base': 0.65,
                    'day_of_week': weekday,
                    'occasions': occasions,
                    'season': month
                }
            }
            
        except Exception as e:
            print(f"Error calculating occupancy: {e}")
            return {
                'occupancy_percentage': 65.0,
                'occupied_rooms': 65,
                'total_rooms': 100,
                'source': 'default'
            }
    
    def update_occupancy_data(self, date, actual_occupancy=None, total_rooms=None, occupied_rooms=None):
        """Update actual occupancy data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if actual_occupancy is None and occupied_rooms is not None and total_rooms is not None:
                actual_occupancy = (occupied_rooms / total_rooms) * 100
            
            cursor.execute('''
                INSERT OR REPLACE INTO occupancy_data 
                (date, actual_occupancy, total_rooms, occupied_rooms)
                VALUES (?, ?, ?, ?)
            ''', (date.strftime('%Y-%m-%d'), actual_occupancy, total_rooms, occupied_rooms))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error updating occupancy data: {e}")
    
    def calculate_occupancy_factor(self, date, base_occupancy=0.7, use_actual_data=True):
        """Calculate pricing factor based on expected occupancy with actual data integration"""
        if use_actual_data:
            occupancy_data = self.calculate_occupancy_percentage(date)
            occupancy_percentage = occupancy_data['occupancy_percentage'] / 100.0
        else:
            occasions = self.get_holidays_and_occasions(date)
            
            if occasions:
                base_occupancy += 0.2
            
            weekday = date.weekday()
            if weekday >= 5: 
                base_occupancy += 0.1
            
            occupancy_percentage = min(0.95, max(0.3, base_occupancy))
        
        # Higher occupancy = higher prices with more granular scaling
        if occupancy_percentage >= 0.9:
            return 1.6
        elif occupancy_percentage >= 0.85:
            return 1.4
        elif occupancy_percentage >= 0.8:
            return 1.3
        elif occupancy_percentage >= 0.75:
            return 1.2
        elif occupancy_percentage >= 0.7:
            return 1.1
        elif occupancy_percentage >= 0.6:
            return 1.0
        elif occupancy_percentage >= 0.5:
            return 0.95
        else:
            return 0.9
    
    def calculate_demand_factor(self, date, historical_demand=1.0):
        """Calculate demand factor based on date and historical data"""
        occasions = self.get_holidays_and_occasions(date)
        
        demand_factor = historical_demand
        
        # Apply occasion multipliers
        if occasions:
            max_multiplier = 1.0
            for occasion in occasions:
                if occasion in self.occasion_multipliers:
                    max_multiplier = max(max_multiplier, self.occasion_multipliers[occasion])
            demand_factor *= max_multiplier
        
        # Weekend premium
        if date.weekday() >= 5:
            demand_factor *= 1.2
        
        return min(3.0, max(0.5, demand_factor))  # Cap between 0.5x and 3.0x
    
    def generate_training_data(self, num_samples=10000):
        """Generate synthetic training data focusing on daily rates"""
        np.random.seed(42)
        
        data = []
        start_date = datetime.now()
        
        room_types = ['Standard', 'Deluxe', 'Suite', 'Premium', 'Executive']
        rate_types = ['EP', 'CP', 'MAP', 'AP', 'AI']
        
        for _ in range(num_samples):
            # Random date within next 365 days
            current_date = start_date + timedelta(days=int(np.random.randint(1, 365)))
            
            room_type = np.random.choice(room_types)
            rate_type = np.random.choice(rate_types)
            
            # Base price based on room type and rate type
            base_room_prices = {'Standard': 100, 'Deluxe': 150, 'Suite': 250, 'Premium': 350, 'Executive': 450}
            base_price = base_room_prices[room_type] * self.rate_type_multipliers[rate_type]
            
            # Get occasions and factors
            occasions = self.get_holidays_and_occasions(current_date)
            occupancy_factor = self.calculate_occupancy_factor(current_date)
            demand_factor = self.calculate_demand_factor(current_date)
            
            # Market variability
            market_factor = np.random.normal(1.0, 0.1)
            market_factor = max(0.8, min(1.3, market_factor))
            
            # Calculate final price
            final_price = base_price * occupancy_factor * demand_factor * market_factor
            final_price *= np.random.normal(1.0, 0.05)  # Small random variation
            
            data.append({
                'date': current_date,
                'room_type': room_type,
                'rate_type': rate_type,
                'weekday': current_date.weekday(),
                'month': current_date.month,
                'day_of_month': current_date.day,
                'is_weekend': 1 if current_date.weekday() >= 5 else 0,
                'is_holiday': 1 if occasions else 0,
                'num_occasions': len(occasions),
                'base_price': base_price,
                'final_price': final_price,
                'occupancy_factor': occupancy_factor,
                'demand_factor': demand_factor
            })
        
        return pd.DataFrame(data)
    
    def prepare_features(self, df):
        """Prepare features for training"""
        # Encode room type and rate type
        df['room_type_encoded'] = self.room_type_encoder.fit_transform(df['room_type'])
        df['rate_type_encoded'] = LabelEncoder().fit_transform(df['rate_type'])
        
        feature_columns = [
            'weekday', 'month', 'day_of_month', 'is_weekend', 'is_holiday',
            'num_occasions', 'base_price', 'room_type_encoded', 'rate_type_encoded'
        ]
        
        return df[feature_columns]
    
    def train_model(self):
        """Train the dynamic pricing model"""
        print("Generating training data...")
        df = self.generate_training_data()
        
        print("Preparing features...")
        X = self.prepare_features(df)
        y = df['final_price']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print("Training model...")
        
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"Model Performance:")
        print(f"Mean Absolute Error: ${mae:.2f}")
        print(f"Root Mean Square Error: ${rmse:.2f}")
        
        return self.model
    
    def predict_daily_rates(self, base_rates, room_type, rate_type, year_start, custom_multipliers=None, use_historical_fallback=True):
        """Predict dynamic prices for each day's base rate with enhanced multiplier management"""
        try:
            if not base_rates or len(base_rates) == 0:
                return []
            
            predictions = []
            year_start_date = datetime.strptime(str(year_start)[:10], '%Y-%m-%d')
            
            for i, base_rate in enumerate(base_rates):
                try:
                    # Calculate date for this rate
                    current_date = year_start_date + timedelta(days=i)
                    
                    # Skip if we've gone beyond the rate year
                    if current_date.year > year_start_date.year + 1 and current_date.month > 3:
                        break
                    
                    # Convert Decimal to float if needed
                    base_price = float(base_rate)
                    
                    # Determine multiplier to use
                    multiplier_to_use = 1.0
                    multiplier_source = 'default'
                    
                    # 1. Check if custom multipliers are provided
                    if custom_multipliers and len(custom_multipliers) > i:
                        multiplier_to_use = float(custom_multipliers[i])
                        multiplier_source = 'custom'
                    
                    # 2. If no custom multiplier, try historical data
                    elif use_historical_fallback:
                        historical_multiplier = self.get_historical_multiplier(current_date, room_type, rate_type)
                        if historical_multiplier != 1.0:
                            multiplier_to_use = historical_multiplier
                            multiplier_source = 'historical'
                    
                    # Get occasions and factors for calculation or display
                    occasions = self.get_holidays_and_occasions(current_date)
                    occupancy_data = self.calculate_occupancy_percentage(current_date)
                    occupancy_factor = self.calculate_occupancy_factor(current_date, use_actual_data=True)
                    demand_factor = self.calculate_demand_factor(current_date)
                    
                    # Calculate dynamic rate
                    if multiplier_source in ['custom', 'historical']:
                        # Use provided or historical multiplier
                        dynamic_rate = base_price * multiplier_to_use
                    else:
                        # Use ML prediction
                        if self.model is not None:
                            try:
                                # Prepare features for prediction
                                features = {
                                    'weekday': current_date.weekday(),
                                    'month': current_date.month,
                                    'day_of_month': current_date.day,
                                    'is_weekend': 1 if current_date.weekday() >= 5 else 0,
                                    'is_holiday': 1 if occasions else 0,
                                    'num_occasions': len(occasions),
                                    'base_price': base_price,
                                    'room_type_encoded': self.room_type_encoder.transform([room_type])[0],
                                    'rate_type_encoded': LabelEncoder().fit_transform([rate_type])[0]
                                }
                                
                                # Convert to array and scale
                                feature_array = np.array([[features[col] for col in [
                                    'weekday', 'month', 'day_of_month', 'is_weekend', 'is_holiday',
                                    'num_occasions', 'base_price', 'room_type_encoded', 'rate_type_encoded'
                                ]]])
                                
                                feature_array_scaled = self.scaler.transform(feature_array)
                                dynamic_rate = float(self.model.predict(feature_array_scaled)[0])
                                multiplier_source = 'ml_prediction'
                            except Exception as ml_error:
                                # Fallback to factor-based calculation
                                dynamic_rate = base_price * occupancy_factor * demand_factor
                                multiplier_source = 'factor_calculation'
                        else:
                            # Model not available, use factor-based calculation
                            dynamic_rate = base_price * occupancy_factor * demand_factor
                            multiplier_source = 'factor_calculation'
                        
                        multiplier_to_use = dynamic_rate / base_price
                    
                    # Ensure reasonable bounds
                    min_price = base_price * 0.4  # Minimum 40% of base
                    max_price = base_price * 4.0  # Maximum 400% of base
                    dynamic_rate = max(min_price, min(max_price, dynamic_rate))
                    final_multiplier = dynamic_rate / base_price
                    
                    # Save multiplier to history for future use
                    self.save_multiplier(current_date, room_type, rate_type, final_multiplier, 
                                       base_price, dynamic_rate, occupancy_factor, demand_factor)
                    
                    prediction_result = {
                        'date': current_date.strftime('%Y-%m-%d'),
                        'base_rate': base_price,
                        'dynamic_rate': round(dynamic_rate, 2),
                        'multiplier': round(final_multiplier, 2),
                        'multiplier_source': multiplier_source,
                        'occupancy_factor': occupancy_factor,
                        'demand_factor': demand_factor,
                        'occupancy_data': occupancy_data,
                        'occasions': occasions,
                        'room_type': room_type,
                        'rate_type': rate_type,
                        'dependencies_applied': True
                    }
                    
                    predictions.append(prediction_result)
                    
                except Exception as e:
                    # Enhanced fallback with historical data
                    historical_multiplier = 1.0
                    if use_historical_fallback:
                        historical_multiplier = self.get_historical_multiplier(current_date, room_type, rate_type)
                    
                    fallback_rate = float(base_rate) * historical_multiplier
                    
                    predictions.append({
                        'date': (year_start_date + timedelta(days=i)).strftime('%Y-%m-%d'),
                        'base_rate': float(base_rate),
                        'dynamic_rate': fallback_rate,
                        'multiplier': historical_multiplier,
                        'multiplier_source': 'historical_fallback' if historical_multiplier != 1.0 else 'error_fallback',
                        'occupancy_factor': 1.0,
                        'demand_factor': 1.0,
                        'occupancy_data': {'occupancy_percentage': 65.0, 'source': 'default'},
                        'occasions': [],
                        'room_type': room_type,
                        'rate_type': rate_type,
                        'dependencies_applied': False,
                        'error': str(e)
                    })
            
            return predictions
            
        except Exception as e:
            print(f"Error in predict_daily_rates: {str(e)}")
            # Enhanced fallback with historical data
            fallback_predictions = []
            year_start_date = datetime.strptime(str(year_start)[:10], '%Y-%m-%d')
            
            for i, base_rate in enumerate(base_rates):
                current_date = year_start_date + timedelta(days=i)
                historical_multiplier = 1.0
                
                if use_historical_fallback:
                    historical_multiplier = self.get_historical_multiplier(current_date, room_type, rate_type)
                
                fallback_predictions.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'base_rate': float(base_rate),
                    'dynamic_rate': float(base_rate) * historical_multiplier,
                    'multiplier': historical_multiplier,
                    'multiplier_source': 'system_fallback',
                    'occupancy_factor': 1.0,
                    'demand_factor': 1.0,
                    'occupancy_data': {'occupancy_percentage': 65.0, 'source': 'default'},
                    'occasions': [],
                    'room_type': room_type,
                    'rate_type': rate_type,
                    'dependencies_applied': False,
                    'error': 'System error, using historical fallback'
                })
            
            return fallback_predictions
    
    def save_model(self, filepath='hotel_pricing_model.pkl'):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'room_type_encoder': self.room_type_encoder,
            'rate_type_multipliers': self.rate_type_multipliers,
            'occasion_multipliers': self.occasion_multipliers
        }
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath='hotel_pricing_model.pkl'):
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.room_type_encoder = model_data['room_type_encoder']
        self.rate_type_multipliers = model_data['rate_type_multipliers']
        self.occasion_multipliers = model_data['occasion_multipliers']


# Flask API for integration
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
pricing_model = HotelDynamicPricingModel()

# Load model on startup
# ✅ Load model immediately on startup (Flask 3.0+ compatible)
def load_model_on_startup():
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'hotel_pricing_model.pkl')
        if os.path.exists(model_path):
            # Try to remove the old model file if it has compatibility issues
            try:
                pricing_model.load_model(model_path)
                print("✅ Dynamic pricing model loaded successfully")
            except Exception as load_error:
                print(f"⚠️ Model loading failed ({load_error}), removing old model and training new one...")
                os.remove(model_path)
                print("Training new dynamic pricing model...")
                pricing_model.train_model()
                pricing_model.save_model(model_path)
                print("✅ New model trained and saved successfully")
        else:
            print("⚠️ No trained model found. Training new model...")
            print("Training dynamic pricing model...")
            pricing_model.train_model()
            pricing_model.save_model(model_path)
            print("✅ Model trained and saved successfully")
    except Exception as e:
        print(f"❌ Error in model setup: {e}")
        print("⚠️ Running without trained model - will use fallback calculations")

# Call immediately after creating the Flask app
load_model_on_startup()


@app.route('/predict-daily-rates', methods=['POST'])
def predict_daily_rates():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['base_rates', 'room_type', 'rate_type', 'year_start']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        base_rates = data['base_rates']
        room_type = data['room_type']
        rate_type = data['rate_type']
        year_start = data['year_start']
        
        # Optional parameters
        custom_multipliers = data.get('custom_multipliers', None)
        use_historical_fallback = data.get('use_historical_fallback', True)
        
        # Predict dynamic rates with enhanced multiplier management
        predictions = pricing_model.predict_daily_rates(
            base_rates=base_rates,
            room_type=room_type,
            rate_type=rate_type,
            year_start=year_start,
            custom_multipliers=custom_multipliers,
            use_historical_fallback=use_historical_fallback
        )
        
        # Calculate summary statistics
        total_base_revenue = sum(p['base_rate'] for p in predictions)
        total_dynamic_revenue = sum(p['dynamic_rate'] for p in predictions)
        average_multiplier = sum(p['multiplier'] for p in predictions) / len(predictions) if predictions else 1.0
        revenue_increase = ((total_dynamic_revenue - total_base_revenue) / total_base_revenue * 100) if total_base_revenue > 0 else 0
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'room_type': room_type,
            'rate_type': rate_type,
            'total_days': len(predictions),
            'summary': {
                'total_base_revenue': round(total_base_revenue, 2),
                'total_dynamic_revenue': round(total_dynamic_revenue, 2),
                'average_multiplier': round(average_multiplier, 2),
                'revenue_increase_percent': round(revenue_increase, 2),
                'dependencies_applied': all(p.get('dependencies_applied', False) for p in predictions)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/occupancy-data', methods=['POST'])
def update_occupancy_data():
    """Update actual occupancy data for a specific date"""
    try:
        data = request.json
        required_fields = ['date']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        date = datetime.strptime(data['date'], '%Y-%m-%d')
        actual_occupancy = data.get('actual_occupancy')
        total_rooms = data.get('total_rooms')
        occupied_rooms = data.get('occupied_rooms')
        
        pricing_model.update_occupancy_data(date, actual_occupancy, total_rooms, occupied_rooms)
        
        return jsonify({
            'success': True,
            'message': 'Occupancy data updated successfully',
            'date': data['date']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/occupancy-data/<date>', methods=['GET'])
def get_occupancy_data(date):
    """Get occupancy data for a specific date"""
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d')
        occupancy_data = pricing_model.calculate_occupancy_percentage(target_date)
        
        return jsonify({
            'success': True,
            'date': date,
            'occupancy_data': occupancy_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/multiplier-history', methods=['GET'])
def get_multiplier_history():
    """Get multiplier history for analysis"""
    try:
        room_type = request.args.get('room_type')
        rate_type = request.args.get('rate_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        conn = sqlite3.connect(pricing_model.db_path)
        cursor = conn.cursor()
        
        query = '''
            SELECT date, room_type, rate_type, multiplier, base_rate, dynamic_rate,
                   occupancy_factor, demand_factor, created_at
            FROM multiplier_history
            WHERE 1=1
        '''
        params = []
        
        if room_type:
            query += ' AND room_type = ?'
            params.append(room_type)
        
        if rate_type:
            query += ' AND rate_type = ?'
            params.append(rate_type)
        
        if start_date:
            query += ' AND date >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND date <= ?'
            params.append(end_date)
        
        query += ' ORDER BY date DESC LIMIT 1000'
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        
        history = []
        for row in results:
            history.append({
                'date': row[0],
                'room_type': row[1],
                'rate_type': row[2],
                'multiplier': row[3],
                'base_rate': row[4],
                'dynamic_rate': row[5],
                'occupancy_factor': row[6],
                'demand_factor': row[7],
                'created_at': row[8]
            })
        
        return jsonify({
            'success': True,
            'history': history,
            'total_records': len(history)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/revenue-analytics', methods=['GET'])
def get_revenue_analytics():
    """Get comprehensive revenue analytics"""
    try:
        start_date = request.args.get('start_date', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        
        conn = sqlite3.connect(pricing_model.db_path)
        cursor = conn.cursor()
        
        # Get multiplier trends
        cursor.execute('''
            SELECT date, AVG(multiplier) as avg_multiplier, 
                   AVG(occupancy_factor) as avg_occupancy,
                   AVG(demand_factor) as avg_demand,
                   COUNT(*) as room_count
            FROM multiplier_history 
            WHERE date >= ? AND date <= ?
            GROUP BY date
            ORDER BY date
        ''', (start_date, end_date))
        
        daily_trends = []
        for row in cursor.fetchall():
            daily_trends.append({
                'date': row[0],
                'average_multiplier': round(row[1], 2),
                'average_occupancy_factor': round(row[2], 2),
                'average_demand_factor': round(row[3], 2),
                'room_count': row[4]
            })
        
        # Get room type performance
        cursor.execute('''
            SELECT room_type, rate_type, 
                   AVG(multiplier) as avg_multiplier,
                   AVG(dynamic_rate - base_rate) as avg_revenue_gain,
                   COUNT(*) as booking_days
            FROM multiplier_history 
            WHERE date >= ? AND date <= ?
            GROUP BY room_type, rate_type
            ORDER BY avg_revenue_gain DESC
        ''', (start_date, end_date))
        
        room_performance = []
        for row in cursor.fetchall():
            room_performance.append({
                'room_type': row[0],
                'rate_type': row[1],
                'average_multiplier': round(row[2], 2),
                'average_revenue_gain': round(row[3], 2),
                'booking_days': row[4]
            })
        
        # Get occupancy trends
        cursor.execute('''
            SELECT date, actual_occupancy, occupied_rooms, total_rooms
            FROM occupancy_data 
            WHERE date >= ? AND date <= ?
            ORDER BY date
        ''', (start_date, end_date))
        
        occupancy_trends = []
        for row in cursor.fetchall():
            occupancy_trends.append({
                'date': row[0],
                'occupancy_percentage': row[1],
                'occupied_rooms': row[2],
                'total_rooms': row[3]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'analytics': {
                'daily_trends': daily_trends,
                'room_performance': room_performance,
                'occupancy_trends': occupancy_trends,
                'summary': {
                    'total_days': len(daily_trends),
                    'average_multiplier': sum(d['average_multiplier'] for d in daily_trends) / len(daily_trends) if daily_trends else 1.0,
                    'best_performing_room': room_performance[0] if room_performance else None,
                    'average_occupancy': sum(o['occupancy_percentage'] or 0 for o in occupancy_trends) / len(occupancy_trends) if occupancy_trends else None
                }
            },
            'date_range': {
                'start': start_date,
                'end': end_date
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/set-custom-multiplier', methods=['POST'])
def set_custom_multiplier():
    """Set a custom multiplier for specific date/room/rate combination"""
    try:
        data = request.json
        required_fields = ['date', 'room_type', 'rate_type', 'multiplier']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        date = datetime.strptime(data['date'], '%Y-%m-%d')
        room_type = data['room_type']
        rate_type = data['rate_type']
        multiplier = float(data['multiplier'])
        
        # Validate multiplier range
        if not (0.1 <= multiplier <= 10.0):
            return jsonify({'error': 'Multiplier must be between 0.1 and 10.0'}), 400
        
        # Calculate base rate and dynamic rate (assuming base rate is provided or calculated)
        base_rate = data.get('base_rate', 100.0)  # Default base rate if not provided
        dynamic_rate = base_rate * multiplier
        
        # Save the custom multiplier
        pricing_model.save_multiplier(
            date, room_type, rate_type, multiplier,
            base_rate, dynamic_rate, 1.0, 1.0  # Default factors for custom multipliers
        )
        
        return jsonify({
            'success': True,
            'message': 'Custom multiplier set successfully',
            'data': {
                'date': data['date'],
                'room_type': room_type,
                'rate_type': rate_type,
                'multiplier': multiplier,
                'dynamic_rate': dynamic_rate
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'model_loaded': pricing_model.model is not None,
        'database_initialized': os.path.exists(pricing_model.db_path),
        'version': '2.0.0'
    })

if __name__ == '__main__':
    # Train model if it doesn't exist
    model_path = os.path.join(os.path.dirname(__file__), 'hotel_pricing_model.pkl')
    if not os.path.exists(model_path):
        print("Training dynamic pricing model...")
        pricing_model.train_model()
        pricing_model.save_model(model_path)
        print("Model trained and saved successfully")
    
    # Run with better configuration for handling multiple requests
    app.run(host='0.0.0.0', port=8001, debug=False, threaded=True)

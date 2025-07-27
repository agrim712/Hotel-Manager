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
warnings.filterwarnings('ignore')

class HotelDynamicPricingModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.room_type_encoder = LabelEncoder()
        self.base_prices = {
            'Standard': 500,
            'Deluxe': 1500, 
            'Suite': 2500,
            'Premium': 3500,
            'Executive': 4500
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
    
    def get_holidays_and_occasions(self, date):
        """Get all holidays and special occasions for a given date"""
        occasions = []
        
        
        us_holidays = holidays.US(years=date.year)
        
        if date in us_holidays:
            holiday_name = us_holidays[date]
            occasions.append(holiday_name)
        
        
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
        
        # Mother's Day (Second Sunday of May)
        if month == 5 and weekday == 6:
            if 8 <= day <= 14:
                occasions.append('Mother\'s Day')
        
        # Father's Day (Third Sunday of June)
        if month == 6 and weekday == 6:
            if 15 <= day <= 21:
                occasions.append('Father\'s Day')
        
        # Halloween
        if month == 10 and day == 31:
            occasions.append('Halloween')
        
        return occasions
    
    def calculate_lead_time_factor(self, checkin_date, booking_date=None):
        """Calculate pricing factor based on lead time"""
        if booking_date is None:
            booking_date = datetime.now()
        
        lead_days = (checkin_date - booking_date).days
        
        if lead_days <= 1:  # Last minute booking
            return 1.4
        elif lead_days <= 7:  # Within a week
            return 1.2
        elif lead_days <= 30:  # Within a month
            return 1.0
        elif lead_days <= 90:  # Early booking
            return 0.9
        else:  # Very early booking
            return 0.85
    
    def calculate_length_of_stay_factor(self, nights):
        """Calculate pricing factor based on length of stay"""
        if nights == 1:
            return 1.1  # Single night premium
        elif nights <= 3:
            return 1.0
        elif nights <= 7:
            return 0.95  # Small discount for week stays
        else:
            return 0.9   # Discount for extended stays
    
    def calculate_room_demand_factor(self, num_rooms):
        """Calculate pricing factor based on number of rooms requested"""
        if num_rooms == 1:
            return 1.0
        elif num_rooms <= 3:
            return 0.98  # Small group discount
        elif num_rooms <= 5:
            return 0.95  # Group discount
        else:
            return 0.9   # Large group discount
    
    def calculate_occupancy_factor(self, checkin_date, simulate_occupancy=True):
        """Calculate pricing factor based on expected occupancy"""
        if simulate_occupancy:
        
            occasions = self.get_holidays_and_occasions(checkin_date)
            base_occupancy = 0.7
            
            if occasions:
                base_occupancy += 0.2  
            
            weekday = checkin_date.weekday()
            if weekday >= 5: 
                base_occupancy += 0.1
            
            
            occupancy = min(0.95, max(0.3, base_occupancy))
        else:
            occupancy = 0.7  
        
        # Higher occupancy = higher prices
        if occupancy >= 0.9:
            return 1.5
        elif occupancy >= 0.8:
            return 1.3
        elif occupancy >= 0.7:
            return 1.1
        elif occupancy >= 0.6:
            return 1.0
        else:
            return 0.9
    
    def generate_training_data(self, num_samples=10000):
        """Generate synthetic training data for the model"""
        np.random.seed(42)
        
        data = []
        start_date = datetime.now()
        
        room_types = list(self.base_prices.keys())
        
        for _ in range(num_samples):
            # Random dates within next 365 days
            checkin_date = start_date + timedelta(days=int(np.random.randint(1, 365)))
            booking_date = checkin_date - timedelta(days=int(np.random.randint(0, 120)))
            
            nights = int(np.random.choice([1, 2, 3, 4, 5, 6, 7, 10, 14], 
                                         p=[0.3, 0.25, 0.2, 0.1, 0.05, 0.04, 0.03, 0.02, 0.01]))
            checkout_date = checkin_date + timedelta(days=nights)
            
            room_type = np.random.choice(room_types)
            num_rooms = int(np.random.choice([1, 2, 3, 4, 5], p=[0.6, 0.2, 0.1, 0.05, 0.05]))
            
            
            base_price = self.base_prices[room_type]
            occasions = self.get_holidays_and_occasions(checkin_date)
            
            
            occasion_multiplier = 1.0
            if occasions:
                for occasion in occasions:
                    if occasion in self.occasion_multipliers:
                        occasion_multiplier = max(occasion_multiplier, 
                                                self.occasion_multipliers[occasion])
            
            lead_time_factor = self.calculate_lead_time_factor(checkin_date, booking_date)
            stay_factor = self.calculate_length_of_stay_factor(nights)
            room_factor = self.calculate_room_demand_factor(num_rooms)
            occupancy_factor = self.calculate_occupancy_factor(checkin_date)
            
            
            market_factor = np.random.normal(1.0, 0.1)
            market_factor = max(0.8, min(1.3, market_factor))
            
            # Calculating final price
            final_price = (base_price * occasion_multiplier * lead_time_factor * 
                          stay_factor * room_factor * occupancy_factor * market_factor)
            
            
            final_price *= np.random.normal(1.0, 0.05)
            final_price = max(base_price * 0.7, final_price)  
            
            data.append({
                'checkin_date': checkin_date,
                'checkout_date': checkout_date,
                'booking_date': booking_date,
                'nights': nights,
                'room_type': room_type,
                'num_rooms': num_rooms,
                'weekday': checkin_date.weekday(),
                'month': checkin_date.month,
                'day_of_month': checkin_date.day,
                'lead_days': (checkin_date - booking_date).days,
                'is_weekend': 1 if checkin_date.weekday() >= 5 else 0,
                'is_holiday': 1 if occasions else 0,
                'num_occasions': len(occasions),
                'max_occasion_multiplier': occasion_multiplier,
                'base_price': base_price,
                'final_price': final_price,
                'occasions': ','.join(occasions) if occasions else 'None'
            })
        
        return pd.DataFrame(data)
    
    def prepare_features(self, df):
        """Prepare features for training"""
        features = []
        
        
        df['room_type_encoded'] = self.room_type_encoder.fit_transform(df['room_type'])
        
        feature_columns = [
            'nights', 'num_rooms', 'weekday', 'month', 'day_of_month',
            'lead_days', 'is_weekend', 'is_holiday', 'num_occasions',
            'max_occasion_multiplier', 'base_price', 'room_type_encoded'
        ]
        
        return df[feature_columns]
    
    def train_model(self):
        """Train the dynamic pricing model"""
        print("Generating training data...")
        df = self.generate_training_data()
        
        print("Preparing features...")
        X = self.prepare_features(df)
        y = df['final_price']
        
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        
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
        
        
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"Model Performance:")
        print(f"Mean Absolute Error: ${mae:.2f}")
        print(f"Root Mean Square Error: ${rmse:.2f}")
        
        
        feature_names = X.columns
        importance = self.model.feature_importances_
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        print("\nTop Feature Importances:")
        print(feature_importance.head(10))
        
        return self.model
    
    def predict_price(self, checkin_date, checkout_date, room_type, num_rooms, 
                     checkin_time=None, checkout_time=None, booking_date=None):
        """Predict price for given reservation parameters"""
        
        if isinstance(checkin_date, str):
            checkin_date = datetime.strptime(checkin_date, '%Y-%m-%d')
        if isinstance(checkout_date, str):
            checkout_date = datetime.strptime(checkout_date, '%Y-%m-%d')
        if booking_date is None:
            booking_date = datetime.now()
        
        nights = (checkout_date - checkin_date).days
        
        
        occasions = self.get_holidays_and_occasions(checkin_date)
        
        
        occasion_multiplier = 1.0
        if occasions:
            for occasion in occasions:
                if occasion in self.occasion_multipliers:
                    occasion_multiplier = max(occasion_multiplier, 
                                            self.occasion_multipliers[occasion])
        
        
        features = {
            'nights': nights,
            'num_rooms': num_rooms,
            'weekday': checkin_date.weekday(),
            'month': checkin_date.month,
            'day_of_month': checkin_date.day,
            'lead_days': (checkin_date - booking_date).days,
            'is_weekend': 1 if checkin_date.weekday() >= 5 else 0,
            'is_holiday': 1 if occasions else 0,
            'num_occasions': len(occasions),
            'max_occasion_multiplier': occasion_multiplier,
            'base_price': self.base_prices.get(room_type, 500),
            'room_type_encoded': self.room_type_encoder.transform([room_type])[0]
        }
        
        
        feature_array = np.array([[features[col] for col in features.keys()]])
        feature_array_scaled = self.scaler.transform(feature_array)
        
        
        predicted_price = self.model.predict(feature_array_scaled)[0]
        
        
        price_breakdown = {
            'base_price': self.base_prices.get(room_type, 500),
            'occasions': occasions,
            'occasion_multiplier': occasion_multiplier,
            'lead_time_factor': self.calculate_lead_time_factor(checkin_date, booking_date),
            'stay_factor': self.calculate_length_of_stay_factor(nights),
            'room_demand_factor': self.calculate_room_demand_factor(num_rooms),
            'occupancy_factor': self.calculate_occupancy_factor(checkin_date),
            'predicted_price_per_night': predicted_price,
            'total_price': predicted_price * nights * num_rooms
        }
        
        return price_breakdown
    
    def save_model(self, filepath='hotel_pricing_model.pkl'):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'room_type_encoder': self.room_type_encoder,
            'base_prices': self.base_prices,
            'occasion_multipliers': self.occasion_multipliers
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath='hotel_pricing_model.pkl'):
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.room_type_encoder = model_data['room_type_encoder']
        self.base_prices = model_data['base_prices']
        self.occasion_multipliers = model_data['occasion_multipliers']
        # Removed print statement that was causing JSON parse errors


def main():
    
    pricing_model = HotelDynamicPricingModel()
    
    print("Training Dynamic Pricing Model...")
    pricing_model.train_model()
    
    # Test predictions for different scenarios
    test_cases = [
        {
            'checkin_date': '2025-12-25',  # Christmas
            'checkout_date': '2025-12-27',
            'room_type': 'Deluxe',
            'num_rooms': 1,
            'description': 'Christmas Weekend'
        },
        {
            'checkin_date': '2025-02-14',  # Valentine's Day
            'checkout_date': '2025-02-15',
            'room_type': 'Suite',
            'num_rooms': 1,
            'description': 'Valentine\'s Day'
        },
        {
            'checkin_date': '2025-07-15',  # Regular summer day
            'checkout_date': '2025-07-20',
            'room_type': 'Standard',
            'num_rooms': 2,
            'description': 'Summer Vacation'
        },
        {
            'checkin_date': '2025-03-10',  # Regular weekday
            'checkout_date': '2025-03-11',
            'room_type': 'Standard',
            'num_rooms': 1,
            'description': 'Regular Weekday'
        }
    ]
    
    print("\n" + "="*80)
    print("PRICE PREDICTIONS FOR DIFFERENT SCENARIOS")
    print("="*80)
    
    for i, case in enumerate(test_cases):
        print(f"\n--- Test Case {i+1}: {case['description']} ---")
        
        prediction = pricing_model.predict_price(
            checkin_date=case['checkin_date'],
            checkout_date=case['checkout_date'],
            room_type=case['room_type'],
            num_rooms=case['num_rooms']
        )
        
        print(f"Check-in: {case['checkin_date']}")
        print(f"Check-out: {case['checkout_date']}")
        print(f"Room Type: {case['room_type']}")
        print(f"Number of Rooms: {case['num_rooms']}")
        print(f"Occasions: {', '.join(prediction['occasions']) if prediction['occasions'] else 'None'}")
        print(f"Base Price: ${prediction['base_price']:.2f}")
        print(f"Occasion Multiplier: {prediction['occasion_multiplier']:.2f}x")
        print(f"Predicted Price per Night: ${prediction['predicted_price_per_night']:.2f}")
        print(f"Total Price: ${prediction['total_price']:.2f}")
        print("-" * 50)
    
    
    pricing_model.save_model()

if __name__ == "__main__":
    main()
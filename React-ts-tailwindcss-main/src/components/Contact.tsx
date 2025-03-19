const Contact = () => (
    <div className="p-10 bg-gray-100 mt-10 rounded-md shadow-md">
      <h2 className="text-xl font-bold">Contact Us</h2>
      <div className="mt-4 space-y-4">
        <input type="text" placeholder="Name" className="border p-2 w-full rounded-md" />
        <input type="email" placeholder="Email" className="border p-2 w-full rounded-md" />
        <input type="tel" placeholder="Phone" className="border p-2 w-full rounded-md" />
        <textarea placeholder="Message" className="border p-2 w-full rounded-md"></textarea>
        <button className="bg-red-500 text-white px-4 py-2 rounded-md">Submit</button>
      </div>
    </div>
  );
  
  export default Contact;
  
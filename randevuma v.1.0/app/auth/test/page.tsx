'use client';

export default function TestPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Test form submitted!');
    alert('Form çalışıyor!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Test Form</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Test input"
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
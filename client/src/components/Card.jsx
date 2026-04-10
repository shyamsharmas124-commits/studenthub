export default function Card({ children }) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      {children}
    </div>
  );
}
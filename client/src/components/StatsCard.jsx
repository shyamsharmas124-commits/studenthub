export default function StatsCard({ title, value }) {
  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow">
      <h3 className="text-gray-400">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
export default function MembersList({ users }) {
  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Members ({users.length})</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

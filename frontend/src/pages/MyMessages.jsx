import { useEffect, useState } from "react";

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [editMessage, setEditMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/contact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/contact/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMessages();
  };

  const handleUpdate = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/contact/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: editMessage }),
    });
    setEditingId(null);
    setEditMessage("");
    fetchMessages();
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">📩 My Messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((msg) => (
            <li
              key={msg._id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              {editingId === msg._id ? (
                <>
                  <input
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="border p-2 rounded w-full mr-2"
                  />
                  <button
                    onClick={() => handleUpdate(msg._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span>{msg.message}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(msg._id);
                        setEditMessage(msg.message);
                      }}
                      className="text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

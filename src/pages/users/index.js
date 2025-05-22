import { useState, useEffect } from 'react';
import styles from './users.module.css';

export default function Users() {

  const [showAddForm, setShowAddForm] = useState(false);

  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error('Failed to create user');
      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setName('');
      setEmail('');
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdate(id) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  }

return (
  <div className={styles.container}>
    <h1 className={styles.title}>User Management</h1>

    {loading && <p className={styles.info}>Loading...</p>}
    {error && <p className={styles.error}>{error}</p>}

    {/* Tombol tambah di atas tabel */}
    <div className={styles.topBar}>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className={styles.addBtn}
      >
        {showAddForm ? 'Close Form' : 'Add User'}
      </button>
    </div>

    {/* Form tambah user, tampilkan jika showAddForm = true */}
    {showAddForm && (
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.submitBtn}>
          Submit
        </button>
      </form>
    )}

    {/* Tabel user */}
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th style={{ textAlign: 'center' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            {editingId === user.id ? (
              <>
                <td>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={styles.input}
                    autoFocus
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={styles.input}
                  />
                </td>
                <td className={styles.actions}>
                  <button onClick={() => handleUpdate(user.id)} className={styles.saveBtn}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </td>
              </>
            ) : (
              <>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className={styles.actions}>
                  <button
                    onClick={() => {
                      setEditingId(user.id);
                      setEditName(user.name);
                      setEditEmail(user.email);
                    }}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user.id)} className={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

}

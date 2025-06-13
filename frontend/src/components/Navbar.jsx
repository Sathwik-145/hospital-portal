import LogoutButton from './LogoutButton';

export default function Navbar({ user = "Healthcare Professional" }) {
  return (
    <div className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>H</span>
        </div>
        <div className="navbar-info">
          <h1>Hospital Portal</h1>
          <p>Advanced Healthcare Management</p>
        </div>
      </div>

      <div className="navbar-actions">
        <button className="navbar-btn">
          🔔
        </button>

        <div className="user-info">
          <div className="user-avatar">
            👤
          </div>
          <span>{user}</span>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
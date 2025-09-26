import React from 'react';
import '../styles/UserProfilePage.css';

const UserProfilePage: React.FC = () => {
  // Placeholder user data; replace with real data fetching as needed
  const user = {
    name: 'Ismael Peña',
    username: 'ismaxxx69',
    email: 'ipenae@unal.edu.co',
    profilePhoto: 'https://via.placeholder.com/150',
  };

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <img src={user.profilePhoto} alt="Profile" className="profile-photo" />
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
      <div className="profile-tabs">
        <button className="tab active">Settings</button>
        <div className="tab-content">
          {/* Settings content can be added here */}
          <p>Settings tab (empty for now)</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

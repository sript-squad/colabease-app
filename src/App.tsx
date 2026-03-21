import { useEffect, useState } from 'react'
import './App.css'
import { getCurrentUser, signInWithRedirect, signOut } from '@aws-amplify/auth';

function App() {
  const [user, setUser] = useState<any>(null);

  async function checkUser() {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <div>

      <h1>React Cognito OAuth</h1>

      {!user ? (
        <button
          onClick={() => signInWithRedirect()}
        >
          Login
        </button>
      ) : (
        <>
          <p>Welcome {user.username}</p>

          <button
            onClick={() => signOut()}
          >
            Logout
          </button>
        </>
      )}

    </div>
  );

}

export default App

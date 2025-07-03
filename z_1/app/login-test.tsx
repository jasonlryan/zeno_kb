import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function LoginTestPage() {
  const { user, role, loading, signIn, signOut } = useSupabaseAuth();

  // Replace these with your real test user passwords
  const testAdmin = { email: "testuser1@example.com", password: "zeno2025" };
  const testStandard = { email: "testuser2@example.com", password: "zeno2025" };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Not logged in</h2>
        <button onClick={() => signIn(testAdmin.email, testAdmin.password)} style={{ marginRight: 8 }}>
          Login as Admin
        </button>
        <button onClick={() => signIn(testStandard.email, testStandard.password)}>
          Login as Standard
        </button>
        <p style={{ marginTop: 16, color: 'gray' }}>
          (Replace passwords in code before testing)
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Logged in as: {user.email}</h2>
      <p>Role: <b>{role}</b></p>
      {role === "admin" && <div style={{ color: 'green', margin: '16px 0' }}>Welcome, admin! You can see admin content.</div>}
      {role === "standard" && <div style={{ color: 'blue', margin: '16px 0' }}>Welcome, standard user! You have limited access.</div>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
} 
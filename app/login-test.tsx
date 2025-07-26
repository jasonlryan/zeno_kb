import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

export default function LoginTestPage() {
  const { user, role, loading, signIn, signOut } = useSupabaseAuth();

  // Replace these with your real test user passwords
  const testAdmin = { email: "testuser1@example.com", password: "zeno2025" };
  const testStandard = { email: "testuser2@example.com", password: "zeno2025" };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="zeno-content-padding">
        <h2 className="zeno-heading">Not logged in</h2>
        <button
          onClick={() => signIn(testAdmin.email, testAdmin.password)}
          className="zeno-button zeno-primary mr-2"
        >
          Login as Admin
        </button>
        <button
          onClick={() => signIn(testStandard.email, testStandard.password)}
          className="zeno-button zeno-secondary"
        >
          Login as Standard
        </button>
        <p className="zeno-body text-muted-foreground mt-4">
          (Replace passwords in code before testing)
        </p>
      </div>
    );
  }

  return (
    <div className="zeno-content-padding">
      <h2 className="zeno-heading">Logged in as: {user.email}</h2>
      <p className="zeno-body">
        Role: <b>{role}</b>
      </p>
      {role === "admin" && (
        <div className="text-green-600 my-4 zeno-body">
          Welcome, admin! You can see admin content.
        </div>
      )}
      {role === "standard" && (
        <div className="text-blue-600 my-4 zeno-body">
          Welcome, standard user! You have limited access.
        </div>
      )}
      <button onClick={signOut} className="zeno-button zeno-secondary">
        Sign Out
      </button>
    </div>
  );
}

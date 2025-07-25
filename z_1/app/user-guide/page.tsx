import React from "react";

export default function UserGuidePage() {
  return (
    <div className="zeno-content-padding max-w-4xl mx-auto py-10 px-8">
      <h1 className="zeno-heading text-3xl font-bold mb-4 text-green-700">
        Zeno AI Knowledge Base – Beta User Guide
      </h1>
      <p className="zeno-body mb-6">
        Welcome to the Zeno AI Knowledge Base beta!
        <br />
        Thank you for helping us test and improve our platform.
      </p>

      <section className="mb-6">
        <h2 className="zeno-heading text-xl font-semibold mb-2">
          What is the Zeno AI Knowledge Base?
        </h2>
        <p className="zeno-body">
          The Zeno AI Knowledge Base is your organization’s hub for discovering
          and learning about AI tools, resources, and best practices. You can
          chat with the built-in AI assistant to get answers, recommendations,
          and guidance on using AI in your work.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="zeno-heading text-xl font-semibold mb-2">How to Use</h2>
        <ol className="zeno-body list-decimal list-inside space-y-1">
          <li>
            <b>Chat with the AI:</b> On the home page, simply type your question
            for the AI (for example, “What’s a good tool for audience insights?”
            or “How do I use AI in client work?”).
          </li>
          <li>
            <b>Browse:</b> Explore featured tools, categories, and new
            resources.
          </li>
          <li>
            <b>Save & Share:</b> Save useful tools to your library or share them
            with colleagues.
          </li>
          <li>
            <b>Give Feedback:</b> Use the feedback options to let us know if
            something is helpful or needs improvement.
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="zeno-heading text-xl font-semibold mb-2">
          What Can You Find Here?
        </h2>
        <ul className="zeno-body list-disc list-inside space-y-1">
          <li>
            <b>AI Tools:</b> Custom GPTs for audience insights, marketing
            trends, research, and more.
          </li>
          <li>
            <b>Guides & Docs:</b> Best practices for using AI, prompt writing,
            and compliance.
          </li>
          <li>
            <b>Learning Resources:</b> Training courses and onboarding materials
            for AI.
          </li>
          <li>
            <b>Featured & Popular:</b> Curated selections of top tools and
            trending resources.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="zeno-heading text-xl font-semibold mb-2">What to Try</h2>
        <ul className="zeno-body list-disc list-inside space-y-1">
          <li>
            Ask the AI Assistant about a specific audience (e.g., “Tell me about
            Gen Z insights”).
          </li>
          <li>
            Request recommendations for tools (e.g., “What’s the best tool for
            digital marketing trends?”).
          </li>
          <li>
            Explore categories like “Strategy & Planning” or “Data +
            Intelligence.”
          </li>
          <li>Save a tool to your library and try sharing it.</li>
          <li>Give feedback on an answer or resource.</li>
        </ul>
      </section>

      <section>
        <h2 className="zeno-heading text-xl font-semibold mb-2">Need Help?</h2>
        <p className="zeno-body">
          If you have questions or feedback, use the feedback button or contact
          our support team.
          <br />
          <br />
          Thank you for being a beta tester!
        </p>
      </section>

      <section className="mt-8">
        <h2 className="zeno-heading text-xl font-semibold mb-2">
          Share Your Experience
        </h2>
        <p className="zeno-body text-green-700">
          We encourage you to keep a log of your experience as you use the Test
          Guide. Your feedback is critical to help us improve—please share your
          notes, suggestions, and any issues you encounter with the team!
        </p>
      </section>
    </div>
  );
}

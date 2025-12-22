export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-8">
          AeroPerk ChatGPT Integration
          <br />
          <strong>Last Updated:</strong> December 20, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            1. Overview
          </h2>
          <p className="text-gray-700 leading-relaxed">
            This privacy policy explains how AeroPerk ("we", "our", "us") collects,
            uses, and protects your information when you use our ChatGPT integration
            app. By using this app, you agree to the collection and use of information
            in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            2. Data We Collect
          </h2>
          <p className="text-gray-700 mb-3">
            When you use the AeroPerk app in ChatGPT, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Account information:</strong> Name and email address when you
              authenticate with your AeroPerk account
            </li>
            <li>
              <strong>Delivery request details:</strong> Pickup and dropoff addresses,
              item descriptions, and reward amounts you provide
            </li>
            <li>
              <strong>Driver route information:</strong> Search queries when looking
              for available drivers
            </li>
            <li>
              <strong>Conversation context:</strong> Information shared by ChatGPT
              that is necessary to process your requests
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            3. How We Use Your Data
          </h2>
          <p className="text-gray-700 mb-3">We use your data to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Create and manage your delivery requests</li>
            <li>Connect you with drivers traveling on matching routes</li>
            <li>Facilitate package deliveries between senders and drivers</li>
            <li>Process payments through our payment processor (Stripe)</li>
            <li>Send notifications about your deliveries</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            4. Data Sharing
          </h2>
          <p className="text-gray-700 mb-3">We share your data with:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>OpenAI:</strong> As required to operate within the ChatGPT
              platform
            </li>
            <li>
              <strong>Drivers:</strong> Your name, delivery details, and contact
              information when you connect with a driver
            </li>
            <li>
              <strong>Stripe:</strong> Payment information for processing transactions
            </li>
            <li>
              <strong>AWS:</strong> For secure data storage and email delivery
            </li>
          </ul>
          <p className="text-gray-700 mt-3 font-medium">
            We do NOT sell your personal data to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            5. Data Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
            <li>All data is transmitted over HTTPS (TLS encryption)</li>
            <li>JWT tokens for secure authentication</li>
            <li>Passwords are hashed using bcrypt</li>
            <li>Regular security audits and updates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            6. Data Retention
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your data for as long as your account is active or as needed
            to provide services. Delivery request history is kept for 2 years for
            dispute resolution purposes. You may request deletion of your data at
            any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            7. Your Rights
          </h2>
          <p className="text-gray-700 mb-3">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Disconnect this app from ChatGPT at any time</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            8. Cookies & Tracking
          </h2>
          <p className="text-gray-700 leading-relaxed">
            This MCP server does not use cookies or tracking technologies directly.
            However, the main AeroPerk website may use cookies for authentication
            and analytics purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            9. Changes to This Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and updating
            the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            10. Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this privacy policy or our data
            practices, please contact us:
          </p>
          <ul className="list-none mt-3 space-y-2 text-gray-700">
            <li>
              <strong>Email:</strong>{' '}
              <a
                href="mailto:privacy@aeroperk.com"
                className="text-blue-600 hover:underline"
              >
                privacy@aeroperk.com
              </a>
            </li>
            <li>
              <strong>Website:</strong>{' '}
              <a
                href="https://aeroperk.com"
                className="text-blue-600 hover:underline"
              >
                https://aeroperk.com
              </a>
            </li>
            <li>
              <strong>Support:</strong>{' '}
              <a
                href="mailto:support@aeroperk.com"
                className="text-blue-600 hover:underline"
              >
                support@aeroperk.com
              </a>
            </li>
          </ul>
        </section>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <a
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Smartjects",
  description: "Privacy Policy for Smartjects platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Effective Date: 01 July, 2025</p>

      <div className="prose prose-lg max-w-none">
        <p>
          Smartjects.com ("we," "our," or "us") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, share, and
          protect your personal information when you access and use our platform
          at https://smartjects.com (the "Platform").
        </p>

        <p>By using the Platform, you agree to the terms of this Privacy Policy.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect the following types of information:</p>

        <h3 className="text-xl font-medium mt-6 mb-3">a. Information You Provide</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account Information:</strong> When you register or sign in, we
            collect your name, email address, password, and professional details
            (e.g. company, role).
          </li>
          <li>
            <strong>Profile Data:</strong> You may optionally add details such as
            your company, bio, and profile image.
          </li>
          <li>
            <strong>Proposal and Reaction Data:</strong> We collect data you
            provide when submitting proposals, voting ("I believe," "I need," "I
            provide"), commenting, or signing contracts.
          </li>
          <li>
            <strong>Messages and Support Requests:</strong> If you contact us, we
            collect your message and contact information.
          </li>
        </ul>

        <h3 className="text-xl font-medium mt-6 mb-3">
          b. Automatically Collected Information
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Usage Data:</strong> We collect data about your interactions
            with the Platform (pages viewed, time spent, etc.).
          </li>
          <li>
            <strong>Device and Log Information:</strong> We may collect data such
            as IP address, browser type, device identifiers, and operating system.
          </li>
          <li>
            <strong>Cookies and Tracking:</strong> We use cookies and similar
            technologies to enhance user experience, analyze usage, and provide
            personalized content.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          2. How We Use Your Information
        </h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Operate and maintain the Platform;</li>
          <li>
            Enable proposal creation, voting, and smart contract interactions;
          </li>
          <li>Facilitate matching between "I need" and "I provide" users;</li>
          <li>Provide user support and respond to inquiries;</li>
          <li>Improve and optimize Platform performance and user experience;</li>
          <li>Detect, prevent, and address security or technical issues;</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing of Information</h2>
        <p>
          We do not sell your personal information. We may share information in the
          following ways:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>With other users:</strong> Based on your actions (e.g.
            submitting a proposal or reacting with "I need" or "I provide"),
            limited profile and proposal data will be shared only with matched
            users.
          </li>
          <li>
            <strong>With service providers:</strong> We may use trusted third-party
            services (e.g., for hosting, analytics, or email communication) under
            strict confidentiality agreements.
          </li>
          <li>
            <strong>With authorities:</strong> If required by law or to protect our
            rights, safety, or users.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p>
          We implement industry-standard technical and organizational measures to
          protect your information. However, no method of transmission over the
          internet is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          5. Your Rights and Choices
        </h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access, update, or delete your personal information;</li>
          <li>Object to or restrict our processing of your data;</li>
          <li>Withdraw consent (where processing is based on consent);</li>
          <li>Lodge a complaint with a data protection authority.</li>
        </ul>
        <p>
          To exercise these rights, contact us at{" "}
          <a href="mailto:team@smartjects.com" className="text-[#FF7100]">
            team@smartjects.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as
          needed to provide services, resolve disputes, or comply with legal
          obligations. You may request deletion of your data by contacting us.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          7. International Data Transfers
        </h2>
        <p>
          If you are located outside of the country where our servers are hosted,
          please note that your information may be transferred to and processed in
          countries with different data protection laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
        <p>
          The Platform is not intended for children under the age of 16. We do not
          knowingly collect personal data from children. If we become aware of such
          data, we will delete it immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          9. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this policy from time to time. We will notify you of
          significant changes via email or on the Platform. The updated policy will
          be effective when posted.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please
          contact us at:
        </p>
        <p>
          Email:{" "}
          <a href="mailto:team@smartjects.com" className="text-[#FF7100]">
            team@smartjects.com
          </a>
        </p>
        <p>Address: 2, Rue Pierre-Joseph Redouté, 2435 Luxembourg</p>
      </div>
    </div>
  );
}

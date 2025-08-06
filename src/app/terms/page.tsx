export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-effect-strong premium-border p-12">
          <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Terms of Service</h1>
          
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using AI Betting Tips (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p>
                AI Betting Tips provides AI-powered betting analysis and predictions for sports events. Our service includes free daily picks and premium subscription features including additional expert picks and advanced filtering options.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Age Restriction</h2>
              <p>
                You must be at least 18 years old (or the legal gambling age in your jurisdiction) to use this service. By using our service, you represent and warrant that you are of legal age.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Disclaimer</h2>
              <p>
                AI Betting Tips provides predictions and analysis for entertainment purposes. All betting predictions are based on AI analysis and statistical models, but gambling involves risk and you may lose money. We are not responsible for any losses incurred through betting activities.
              </p>
              <p className="mt-4 font-semibold text-accent-pink">
                Gambling can be addictive. Please gamble responsibly and within your means.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription Terms</h2>
              <p>
                Premium subscriptions are billed monthly at $19.99/month. Subscriptions automatically renew unless cancelled. You may cancel your subscription at any time through your account settings or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
              <p>
                AI Betting Tips shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use of the service, including but not limited to damages for loss of profits, data, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at legal@aibettingtips.com
              </p>
            </section>

            <div className="pt-8 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
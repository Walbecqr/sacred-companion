'use client';

import { Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-4xl mx-auto p-8">
        {/* Back Navigation */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Coming Soon Content */}
        <div className="text-center space-y-8">
          <div className="relative">
            <BookOpen className="w-24 h-24 text-purple-400 mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-300 animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sacred Library
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A comprehensive collection of spiritual texts, rituals, and wisdom
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-8 border border-purple-200 dark:border-purple-700">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
                         <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
               We&apos;re curating a sacred library filled with ancient wisdom, modern practices, 
               and personalized spiritual resources. This will be your digital grimoire, 
               offering guidance for every step of your journey.
             </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">What&apos;s Coming:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Sacred texts and scriptures</li>
                  <li>• Ritual guides and ceremonies</li>
                  <li>• Meditation and mindfulness practices</li>
                  <li>• Herbal and crystal correspondences</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Features:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Personalized reading recommendations</li>
                  <li>• Interactive learning modules</li>
                  <li>• Community-curated content</li>
                  <li>• Offline access to favorites</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

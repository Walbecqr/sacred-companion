'use client';

import { Sparkles, Gem, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReferencePage() {
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
            <Gem className="w-24 h-24 text-purple-400 mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-300 animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sacred Reference
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A comprehensive guide to symbols, correspondences, and spiritual tools
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-8 border border-purple-200 dark:border-purple-700">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              We're building an extensive reference library of spiritual symbols, 
              correspondences, and tools. This will be your go-to resource for 
              understanding the deeper meanings behind your practice.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">What's Coming:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Crystal and gemstone properties</li>
                  <li>• Herbal correspondences and uses</li>
                  <li>• Astrological symbols and meanings</li>
                  <li>• Tarot and divination guides</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Features:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Interactive search and filtering</li>
                  <li>• Personal collection building</li>
                  <li>• Cross-referenced information</li>
                  <li>• Community insights and tips</li>
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

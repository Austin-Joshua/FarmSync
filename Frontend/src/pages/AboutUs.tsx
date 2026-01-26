import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Users, Target, Award, Code, Heart } from 'lucide-react';

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:scale-110 hover:rotate-3">
            <svg 
              className="text-white w-12 h-12"
              viewBox="0 0 24 24" 
              fill="currentColor" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L4 6L12 10L20 6L12 2Z" fill="currentColor" opacity="0.9"/>
              <path d="M4 6L12 10L20 6L12 2L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M12 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M9 14L12 10L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M10 16L12 18L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About FarmSync
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Empowering farmers with digital tools to manage their farms efficiently and sustainably
          </p>
        </div>

        {/* History Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {/* Item 1 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center justify-end mb-3">
                      <Calendar className="w-6 h-6 text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">2024 - Inception</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The Beginning</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      FarmSync was born from a vision to bridge the gap between traditional farming practices and modern technology. 
                      Recognizing the challenges farmers face in managing their operations, we set out to create a comprehensive 
                      digital solution.
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10"></div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* Item 2 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10"></div>
                <div className="w-1/2 pl-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center mb-3">
                      <Code className="w-6 h-6 text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">2024 - Development</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Building the Foundation</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We developed FarmSync using cutting-edge technologies including React, TypeScript, Node.js, and MySQL. 
                      The platform was designed with scalability, security, and user experience at its core. Our team worked 
                      tirelessly to create features that truly serve farmers' needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center justify-end mb-3">
                      <Target className="w-6 h-6 text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">2024 - Launch</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Version 1.0 Release</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      FarmSync V1.0 was launched with a comprehensive suite of features including farm management, 
                      crop tracking, expense management, yield analysis, weather alerts, and AI-powered crop recommendations. 
                      This marked a significant milestone in our mission to digitize agriculture.
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10"></div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* Item 4 */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10"></div>
                <div className="w-1/2 pl-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center mb-3">
                      <Award className="w-6 h-6 text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">2025 - Present</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Continuous Innovation</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Today, FarmSync continues to evolve with regular updates, new features, and improvements based on 
                      user feedback. We remain committed to empowering farmers worldwide with tools that make farming 
                      more efficient, profitable, and sustainable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To revolutionize agriculture by providing farmers with accessible, intuitive, and powerful digital tools 
              that streamline farm management, increase productivity, and promote sustainable farming practices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To become the leading digital platform for farm management, empowering millions of farmers globally to 
              make data-driven decisions, optimize their operations, and contribute to food security worldwide.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What Makes FarmSync Special
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Farmer-Centric Design",
                description: "Built by understanding real farming challenges and needs"
              },
              {
                icon: Code,
                title: "Modern Technology",
                description: "Leveraging the latest web technologies for reliability and performance"
              },
              {
                icon: Award,
                title: "Comprehensive Features",
                description: "All-in-one solution covering every aspect of farm management"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <feature.icon className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 rounded-2xl shadow-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Join the FarmSync Community</h2>
          <p className="text-lg mb-8 opacity-90">
            Start managing your farm more efficiently today. Experience the power of digital agriculture.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Get Started
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Target,
  Brain,
  Zap,
  Shield,
  Award,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  Clock,
  TrendingUp,
  CreditCard,
  Infinity,
  FileText,
  Code2,
  BookOpen,
  BarChart3,
  Mic,
  Briefcase,
  Search,
  Route,
  GraduationCap,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: "Career Readiness Score",
      description:
        "Get a dynamic 0–100 score based on technical skills, resume quality, coding performance, interview performance, projects, and learning consistency.",
    },
    {
      icon: Search,
      title: "AI Skill Gap Analysis",
      description:
        "Compare your current profile with target-role requirements to identify missing skills, weak areas, and resume deficiencies.",
    },
    {
      icon: Route,
      title: "Personalized Career Roadmap",
      description:
        "Receive an adaptive preparation roadmap that continuously changes as your skills, performance, and career goals evolve.",
    },
    {
      icon: FileText,
      title: "AI Resume Optimizer",
      description:
        "Analyze your resume against job descriptions, identify missing keywords, improve content, and enhance ATS compatibility.",
    },
    {
      icon: Mic,
      title: "AI Voice Mock Interviews",
      description:
        "Practice technical, HR, and behavioral interviews with AI-powered voice interaction and receive detailed performance feedback.",
    },
    {
      icon: Code2,
      title: "Coding & Assessments",
      description:
        "Practice Data Structures & Algorithms, aptitude, technical MCQs, and domain-specific assessments while tracking your performance.",
    },
  ];

  const journey = [
    {
      number: "01",
      icon: FileText,
      title: "Onboard",
      description: "Upload your resume and define your target role.",
    },
    {
      number: "02",
      icon: Search,
      title: "Diagnose",
      description: "Analyze your profile and identify skill gaps.",
    },
    {
      number: "03",
      icon: Target,
      title: "Accelerate",
      description: "Follow targeted learning and practice recommendations.",
    },
    {
      number: "04",
      icon: Mic,
      title: "Validate",
      description: "Test your readiness through AI-powered interviews.",
    },
  ];

  const ecosystem = [
    {
      icon: BarChart3,
      title: "Assess",
      description: "Career Readiness Score",
    },
    {
      icon: Search,
      title: "Analyze",
      description: "AI Skill Gap Analyzer",
    },
    {
      icon: FileText,
      title: "Build",
      description: "AI Resume Optimizer",
    },
    {
      icon: BookOpen,
      title: "Learn",
      description: "Personalized Hub",
    },
    {
      icon: Code2,
      title: "Practice",
      description: "Coding & Assessments",
    },
    {
      icon: Mic,
      title: "Interview",
      description: "AI Voice Mock Interview",
    },
    {
      icon: TrendingUp,
      title: "Track",
      description: "Progress Dashboard",
    },
    {
      icon: CreditCard,
      title: "Earn",
      description: "Credit Ecosystem",
    },
  ];

  const targetUsers = [
    {
      icon: GraduationCap,
      title: "Students",
      description:
        "Prepare for internships, campus placements, and technical assessments.",
    },
    {
      icon: Briefcase,
      title: "Fresh Graduates",
      description:
        "Build industry-ready profiles and prepare for entry-level roles.",
    },
    {
      icon: Route,
      title: "Career Switchers",
      description:
        "Identify transferable skills and prepare for a new target role.",
    },
    {
      icon: Award,
      title: "Early-Career Professionals",
      description:
        "Identify gaps and systematically improve career readiness.",
    },
  ];

  const creditActions = [
    "Solve coding challenges",
    "Complete assessments",
    "Participate in mock interviews",
    "Maintain activity streaks",
  ];

  const creditRewards = [
    "Advanced AI interview sessions",
    "Premium assessments",
    "Specialized preparation resources",
    "Additional platform features",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/NexprepLogo.png"
                alt="Veritus Logo"
                width={120}
                height={40}
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#platform"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Platform
              </a>

              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>

              <a
                href="#journey"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Journey
              </a>

              <a
                href="#credits"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Credits
              </a>

              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#platform"
                className="block px-3 py-2 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Platform
              </a>

              <a
                href="#features"
                className="block px-3 py-2 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>

              <a
                href="#journey"
                className="block px-3 py-2 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Journey
              </a>

              <a
                href="#credits"
                className="block px-3 py-2 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Credits
              </a>

              <div className="px-3 py-2">
                <Link href="/auth">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Career Intelligence Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              From Potential
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                to Placement
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform fragmented career preparation into a structured,
              personalized, and data-driven journey with AI-powered career
              intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2"
                onClick={() =>
                  document
                    .getElementById("platform")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Platform
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Platform Flow */}
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                "Assess",
                "Analyze",
                "Build",
                "Learn",
                "Practice",
                "Interview",
                "Track",
                "Earn",
              ].map((item, index) => (
                <React.Fragment key={item}>
                  <div className="px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium text-gray-700">
                    {index + 1}. {item}
                  </div>

                  {index < 7 && (
                    <ChevronRight className="hidden sm:block w-5 text-gray-300 self-center" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PLATFORM ================= */}
      <section id="platform" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
                <Brain className="w-4 h-4 mr-2" />
                The VERITUS Ecosystem
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                One Platform.
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Complete Career Intelligence.
                </span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                VERITUS brings career assessment, skill-gap analysis, resume
                optimization, learning, coding practice, interviews, and
                progress tracking together in one intelligent ecosystem.
              </p>

              <div className="space-y-4">
                {[
                  "Evaluate your current career readiness",
                  "Identify skills required for your target role",
                  "Build an adaptive preparation roadmap",
                  "Practice and validate your skills",
                  "Track measurable improvement",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ecosystem.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Intelligent Preparation
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Become Job Ready
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              VERITUS connects assessment, preparation, practice, and
              evaluation into one continuous career-readiness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= READINESS SCORE ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4 mr-2" />
              Placement Diagnostics
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Know Where You Stand
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your Career Readiness Score provides a measurable view of your
              overall preparation and changes as you improve.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="text-center">
              <p className="text-gray-600 font-medium mb-4">
                Career Readiness Score
              </p>

              <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                67
                <span className="text-3xl text-gray-400"> / 100</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                {[
                  ["Technical Skills", "72"],
                  ["Algorithm Engine", "68"],
                  ["Resume Quality", "61"],
                  ["Learning Streak", "80"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl p-5 shadow-sm"
                  >
                    <div className="text-3xl font-bold text-gray-900">
                      {value}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= JOURNEY ================= */}
      <section
        id="journey"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Career Readiness
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Journey
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Move from an initial profile assessment to validated interview
              readiness through a structured preparation cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {journey.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative">
                  <div className="bg-white rounded-2xl border border-gray-200 p-7 h-full hover:shadow-lg transition-all">
                    <div className="text-sm font-bold text-blue-600 mb-4">
                      PHASE {step.number}
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-gray-600">{step.description}</p>
                  </div>

                  {index < journey.length - 1 && (
                    <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-7 h-7 text-blue-400 z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= AI RESUME + SKILL GAP ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-8 md:p-10">
              <FileText className="w-10 h-10 text-blue-600 mb-6" />

              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Contextual Resume Optimization
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Upload your resume and job description. VERITUS analyzes the
                alignment between your experience and target role requirements
                while keeping the optimization grounded in your actual profile.
              </p>

              <div className="space-y-3">
                {[
                  "ATS compatibility analysis",
                  "Missing keyword identification",
                  "Content improvement suggestions",
                  "Role-specific resume alignment",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-8 md:p-10">
              <Search className="w-10 h-10 text-purple-600 mb-6" />

              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Know What You're Missing
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                VERITUS compares your validated profile with target-role
                requirements and converts identified gaps into actionable
                preparation priorities.
              </p>

              <div className="space-y-4">
                {[
                  ["REST API Architecture", "Matched"],
                  ["PostgreSQL Management", "Matched"],
                  ["Docker Deployment", "Needs Improvement"],
                  ["Redis In-Memory Caching", "Priority Gap"],
                ].map(([skill, status]) => (
                  <div
                    key={skill}
                    className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                  >
                    <span className="text-gray-700 font-medium">{skill}</span>

                    <span
                      className={`text-sm font-semibold ${
                        status === "Matched"
                          ? "text-green-600"
                          : status === "Priority Gap"
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI INTERVIEW ================= */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-6">
            <Mic className="w-4 h-4 mr-2" />
            AI Voice Evaluation
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Practice Before It Matters
          </h2>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
            Simulate technical, HR, and behavioral interviews with voice-based
            AI evaluation and structured feedback.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: Mic,
                title: "Voice Interaction",
                text: "High-fidelity speech capture and transcription.",
              },
              {
                icon: Brain,
                title: "Semantic Evaluation",
                text: "Evaluate responses against structured interview rubrics.",
              },
              {
                icon: TrendingUp,
                title: "Fluency Metrics",
                text: "Analyze communication and delivery patterns.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white/10 border border-white/20 rounded-2xl p-7"
                >
                  <Icon className="w-8 h-8 text-white mb-5" />

                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>

                  <p className="text-blue-100">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TARGET USERS ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Built for Every Career Stage
            </h2>

            <p className="text-xl text-gray-600">
              A structured preparation ecosystem for students, graduates, and
              professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetUsers.map((user) => {
              const Icon = user.icon;

              return (
                <div
                  key={user.title}
                  className="border border-gray-200 rounded-2xl p-7 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <Icon className="w-9 h-9 text-blue-600 mb-5" />

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {user.title}
                  </h3>

                  <p className="text-gray-600">{user.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CREDITS ================= */}
      <section
        id="credits"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <CreditCard className="w-4 h-4 mr-2" />
              Credit-Based Ecosystem
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Learn.
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Earn.
              </span>{" "}
              Redeem.
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay engaged with your preparation by earning credits through
              meaningful platform activities and redeeming them for advanced
              utilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Earn */}
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Earn Credits
              </h3>

              <div className="space-y-4">
                {creditActions.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 md:p-10 shadow-xl text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold mb-6">
                Redeem Credits
              </h3>

              <div className="space-y-4">
                {creditRewards.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white/80" />
                    <span className="text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Credits can also be purchased when additional platform utilities
              are required.
            </p>
          </div>
        </div>
      </section>

      {/* ================= TECHNOLOGY ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-5">
              Built as an AI-Driven Ecosystem
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              VERITUS combines modern web technologies, AI processing,
              structured data, and speech processing to deliver personalized
              career intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ["Frontend", "React.js + Tailwind CSS"],
              ["Backend", "Node.js + Express.js"],
              ["Database", "PostgreSQL / MongoDB"],
              ["AI", "Gemini / OpenAI + AI Models"],
              ["Speech", "Whisper Speech-to-Text"],
              ["Authentication", "JWT + OAuth"],
              ["Deployment", "Vercel + Render / AWS"],
              ["Intelligence", "Recommendation + Interview Engines"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="p-6 bg-gray-50 border border-gray-200 rounded-2xl"
              >
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Turn Uncertainty Into Direction.
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Assess your readiness, identify your gaps, build your roadmap,
            practice with AI, and move toward your placement goals.
          </p>

          <Link href="/auth">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            >
              Start Your VERITUS Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="text-3xl font-bold mb-4">
                VERITUS
              </div>

              <p className="text-gray-400 max-w-md leading-relaxed">
                AI-powered Career Intelligence Platform transforming fragmented
                career preparation into a structured, personalized, and
                measurable journey.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>

              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#journey" className="hover:text-white">
                    Career Journey
                  </a>
                </li>
                <li>
                  <a href="#credits" className="hover:text-white">
                    Credit System
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>

              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/auth" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="hover:text-white">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} VERITUS. All rights reserved.
            </p>

            <p className="text-gray-500 text-sm mt-3 md:mt-0">
              From Potential to Placement
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
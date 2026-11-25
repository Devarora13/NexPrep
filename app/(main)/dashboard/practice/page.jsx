"use client";
import React, { useEffect, useState } from 'react';
import { 
  Code, 
  Brain, 
  FileText, 
  Map, 
  Wrench, 
  ExternalLink, 
  Star, 
  Users,
  BookOpen,
  Video,
  Github,
  Target,
  Award,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import Link from 'next/link';
import { lessons } from '@/lib/practice-catalog';

const studyPaths = [
  { skills: ["javascript","typescript","html","css","react","next.js","tailwind","figma"], path: "Frontend Developer Roadmap", task: "Build an accessible project list with a search field. Explain one design decision and demonstrate how you tested it." },
  { skills: ["sql","postgresql","mongodb","supabase","api","rest","node.js","python","java","c#"], path: "Backend Developer Roadmap", task: "Implement a searchable list of job openings. Describe the data model and test the empty-result case." },
  { skills: ["aws","docker","kubernetes","git"], path: "DevOps Engineer Roadmap", task: "Package a small service, document how it starts, and demonstrate a repeatable deployment or rollback." },
  { skills: ["data structures","algorithms","c++"], path: "Coding and aptitude practice", task: "Solve a sequence problem, test a boundary case, and explain the running time." },
  { skills: ["system design"], path:"System Design Primer", task:"Sketch an interview scheduling service. Explain one failure mode and how the system recovers." },
];

function PracticeResources() {
  const [focus, setFocus] = useState("");
  useEffect(() => setFocus(new URLSearchParams(window.location.search).get("skill") || ""), []);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resourceCategories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'coding', name: 'Coding & DSA', icon: Code },
    { id: 'behavioral', name: 'Behavioral', icon: Brain },
    { id: 'resume', name: 'Resume & Portfolio', icon: FileText },
    { id: 'roadmaps', name: 'Learning Paths', icon: Map },
    { id: 'tools', name: 'Bonus Tools', icon: Wrench },
    { id: 'non-tech', name: 'Non-Tech Roles', icon: Users }
  ];

  const codingResources = [
    {
      title: "Striver's A2Z DSA Sheet",
      description: "Complete Data Structures & Algorithms roadmap with 450+ problems",
      url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
      type: "free",
      difficulty: "beginner-advanced",
      tags: ["DSA", "Problems", "Complete Guide"],
      icon: Target,
      category: 'coding'
    },
    {
      title: "Love Babbar's 450 DSA Questions",
      description: "Curated list of most important coding interview questions",
      url: "https://450dsa.com/",
      type: "free",
      difficulty: "intermediate",
      tags: ["DSA", "Interview Prep", "Curated"],
      icon: Code,
      category: 'coding'
    },
    {
      title: "LeetCode Top Interview Questions",
      description: "Most frequently asked coding questions in FAANG interviews",
      url: "https://leetcode.com/explore/interview/card/top-interview-questions-easy/",
      type: "freemium",
      difficulty: "all-levels",
      tags: ["Leetcode", "FAANG", "Practice"],
      icon: Award,
      category: 'coding'
    },
    {
      title: "Neetcode 150",
      description: "150 essential coding interview problems with video solutions",
      url: "https://neetcode.io/practice/practice/neetcode150",
      type: "free",
      difficulty: "intermediate",
      tags: ["Video Solutions", "Curated", "Patterns"],
      icon: Video,
      category: 'coding'
    },
    {
      title: "The Algorithms - GitHub",
      description: "Open Source resource for learning Data Structures & Algorithms",
      url: "https://github.com/TheAlgorithms",
      type: "free",
      difficulty: "all-levels",
      tags: ["Open Source", "Multiple Languages", "Implementation"],
      icon: Github,
      category: 'coding'
    }
  ];

  const roadmapResources = [
    {
      title: "Frontend Developer Roadmap",
      description: "Complete learning path from beginner to senior frontend developer",
      url: "https://roadmap.sh/frontend",
      type: "free",
      difficulty: "all-levels",
      tags: ["Frontend", "Roadmap"],
      icon: Code,
      category: 'roadmaps'
    },
    {
      title: "Backend Developer Roadmap",
      description: "Comprehensive guide to becoming a backend engineer",
      url: "https://roadmap.sh/backend",
      type: "free",
      difficulty: "all-levels",
      tags: ["Backend", "Server", "APIs"],
      icon: Code,
      category: 'roadmaps'
    },
    {
      title: "DevOps Engineer Roadmap",
      description: "Path to mastering DevOps tools and practices",
      url: "https://roadmap.sh/devops",
      type: "free",
      difficulty: "intermediate",
      tags: ["DevOps", "Infrastructure", "Automation"],
      icon: Wrench,
      category: 'roadmaps'
    },
    {
      title: "System Design Primer",
      description: "Learn how to design large-scale distributed systems",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "free",
      difficulty: "advanced",
      tags: ["System Design", "Architecture", "Scalability"],
      icon: Map,
      category: 'roadmaps'
    }
  ];

  const lessonResources = lessons.map(lesson => ({
    title: lesson.title, description: lesson.steps[0], url: "/dashboard/assessment?activity=" + lesson.id,
    category: lesson.category.toLowerCase(), icon: { star: Star, resume: FileText, testing: Code }[lesson.id],
    type: 'free', difficulty: 'beginner', tags: [lesson.category, 'Learning check'],
  }));
  const allResources = [
    ...codingResources, ...lessonResources, ...roadmapResources,
    { title: "Amazon Leadership Principles", description: "Explore the principles Amazon uses to discuss decisions, teamwork and leadership.",
      url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", category: 'non-tech', icon: Users,
      type: 'free', difficulty: 'all-levels', tags: ['Amazon', 'Leadership', 'Behavioral'] },
    { title: "Coding and aptitude practice", description: "Submit JavaScript solutions or complete a reasoning set and save your score.",
      url: "/dashboard/assessment", category: 'tools', icon: Wrench, type: 'free', difficulty: 'all-levels', tags: ['Coding', 'Aptitude', 'Assessment'] },
    { title: "Advanced interview case", description: "Use one earned credit for a system-design scenario and a self-review rubric.",
      url: "/billing", category: 'behavioral', icon: Brain, type: 'premium', difficulty: 'advanced', tags: ['System Design', 'Practice'] },
  ];
  const focusPath = studyPaths.find(entry => entry.skills.includes(focus));
  const recommended = allResources.find(item => item.title === focusPath?.path);
  const filteredResources = allResources.filter(resource => {
    const matchesFilter = activeFilter === 'all' || resource.category === activeFilter;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const ResourceCard = ({ resource }) => {
    const IconComponent = resource.icon;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {resource.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {resource.type === 'free' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Free</span>
                )}
                {resource.type === 'premium' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Premium</span>
                )}
                {resource.type === 'freemium' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Freemium</span>
                )}
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {resource.difficulty.replace('-', ' ')}
          </span>
          <Button asChild variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-300">
            {resource.url.startsWith('/') ? (
              <Link href={resource.url}>Access <ChevronRight className="w-3 h-3 ml-1" /></Link>
            ) : (
              <a href={resource.url} target="_blank" rel="noopener noreferrer">Access <ChevronRight className="w-3 h-3 ml-1" /></a>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Practice Resources
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your complete interview preparation vault. Curated resources, templates, and tools 
          to help you land your dream job.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{allResources.length}</div>
          <div className="text-sm text-blue-700">Total Resources</div>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {allResources.filter(r => r.type === 'free').length}
          </div>
          <div className="text-sm text-green-700">Free Resources</div>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{resourceCategories.length - 1}</div>
          <div className="text-sm text-purple-700">Categories</div>
        </div>
        <div className="text-center p-6 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{lessons.length}</div>
          <div className="text-sm text-orange-700">Learning Checks</div>
        </div>
      </div>

    {focus && <aside className="mb-8 rounded-xl bg-indigo-50 p-4"><h2 className="font-bold">Practice focus · {focus}</h2>
      <p>{focusPath?.task || "Build a small example using " + focus + ", record the result and explain your contribution."}</p>
      {recommended && <a className="mr-4 underline" href={recommended.url}>Study · {recommended.title}</a>}
      <Link href="/dashboard/create-interview" className="underline">Practice explaining the example</Link></aside>}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            aria-label="Search resources"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select aria-label="Filter by category"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {resourceCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {resourceCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeFilter === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Interview Prep?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Use these resources alongside VERITUS's AI-powered mock interviews to maximize your chances of success.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
            <Link href="/dashboard/create-interview">Start Practice Interview</Link>
          </Button>
          <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-blue-600">
            <Link href="/dashboard/assessment">Open Assessment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PracticeResources;

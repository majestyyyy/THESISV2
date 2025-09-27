"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 flex items-center justify-center mr-4">
              <Image
                src="/LOGO.png"
                alt="AI-GiR Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">AI-GiR Platform</p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Your Privacy Matters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Last updated: September 27, 2025
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              AI-GiR ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered learning platform.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Database className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Information We Collect</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Name and email address when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Communication preferences</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Content</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Documents and study materials you upload</li>
                <li>Quiz responses and performance data</li>
                <li>Learning analytics and progress tracking</li>
                <li>AI-generated content based on your materials</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Log data including IP addresses and browser information</li>
                <li>Device information and operating system</li>
                <li>Usage patterns and feature interactions</li>
                <li>Session duration and frequency of use</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>How We Use Your Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide and maintain our AI-powered learning services</li>
              <li>Generate personalized quizzes and study materials</li>
              <li>Track your learning progress and provide analytics</li>
              <li>Improve our AI algorithms and platform functionality</li>
              <li>Send you important updates about your account</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Lock className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Data Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure cloud infrastructure with Supabase</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. We may share information only in these limited circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With service providers who assist in platform operations (under strict confidentiality agreements)</li>
              <li>In connection with a business transfer (merger, acquisition, etc.)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request copies of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at parungao.johnlloyd@ue.edu.ph
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Data Retention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information only as long as necessary to provide our services and comply with legal obligations. 
              When you delete your account, we will delete your personal information within 30 days, except where we are required 
              to retain it for legal purposes.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Contact Us</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> parungao.johnlloyd@ue.edu.ph</p>
              <p className="text-gray-700"><strong>Platform:</strong> AI-GiR Learning Platform</p>
              <p className="text-gray-700"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy 
              Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/terms">View Terms of Service</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
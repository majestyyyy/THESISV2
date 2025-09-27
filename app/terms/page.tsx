"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, AlertTriangle, Scale, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TermsOfServicePage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600">AI-GiR Platform</p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Agreement to Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Last updated: September 27, 2025
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Welcome to AI-GiR! These Terms of Service ("Terms") govern your use of the AI-GiR learning platform 
              ("Service") operated by AI-GiR ("us," "we," or "our"). By accessing or using our Service, you agree to 
              be bound by these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Scale className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Acceptance of Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              By creating an account or using AI-GiR, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
              If you do not agree to these Terms, please do not use our Service.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You must be at least 13 years old to use this Service</li>
              <li>If you are under 18, you must have parental consent</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the security of your account</li>
            </ul>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Service Description</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI-GiR is an AI-powered learning platform that provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>AI-generated quizzes and study materials from uploaded content</li>
              <li>Learning analytics and progress tracking</li>
              <li>Personalized study recommendations</li>
              <li>Document upload and processing capabilities</li>
              <li>Educational content generation and review tools</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>User Responsibilities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceptable Use</h3>
                <p className="text-gray-700 mb-2">You agree to use AI-GiR only for legitimate educational purposes. You will NOT:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Upload copyrighted material without permission</li>
                  <li>Share inappropriate, offensive, or harmful content</li>
                  <li>Attempt to hack, disrupt, or damage the platform</li>
                  <li>Create multiple accounts or share your account</li>
                  <li>Use the service for commercial purposes without authorization</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Responsibility</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You are responsible for all content you upload</li>
                  <li>You must have the right to upload and process your materials</li>
                  <li>You retain ownership of your original content</li>
                  <li>AI-generated content is provided for educational use only</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Rights</h3>
                <p className="text-gray-700 mb-2">
                  AI-GiR and its original content, features, and functionality are owned by us and are protected by 
                  international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You retain rights to your original uploaded content</li>
                  <li>You grant us a license to process and analyze your content for service provision</li>
                  <li>AI-generated content based on your materials is provided for your educational use</li>
                  <li>You may download and use your generated study materials for personal learning</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Privacy and Data Protection</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
              which is incorporated into these Terms by reference.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>We collect only information necessary to provide our services</li>
              <li>Your educational content is processed to generate personalized learning materials</li>
              <li>We implement security measures to protect your data</li>
              <li>You can request deletion of your account and data at any time</li>
            </ul>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Availability and Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                <p className="text-gray-700">
                  We strive to maintain high availability but cannot guarantee uninterrupted access. 
                  The service may be temporarily unavailable due to maintenance, updates, or technical issues.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modifications</h3>
                <p className="text-gray-700">
                  We reserve the right to modify, suspend, or discontinue any part of the service at any time. 
                  We will provide reasonable notice for significant changes that affect your use of the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
              <CardTitle>Disclaimers and Limitations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 p-4 rounded-lg mb-4">
              <p className="text-orange-800 font-semibold mb-2">Important Notice:</p>
              <p className="text-orange-700 text-sm">
                AI-GiR is an educational tool. While we strive for accuracy, AI-generated content may contain errors. 
                Always verify important information and use the platform as a supplement to, not replacement for, 
                traditional learning methods.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Disclaimers</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>The service is provided "as is" without warranties of any kind</li>
                  <li>We do not guarantee the accuracy of AI-generated content</li>
                  <li>Educational outcomes depend on individual effort and circumstances</li>
                  <li>We are not responsible for content uploaded by users</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, AI-GiR shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages resulting from your use of the service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Right to Terminate</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting us or using the account deletion feature. 
                  Upon termination, your access to the service will cease immediately.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Right to Terminate</h3>
                <p className="text-gray-700">
                  We may terminate or suspend your account immediately if you violate these Terms or engage in 
                  behavior that we determine to be harmful to the service or other users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to update these Terms at any time. We will notify users of significant changes 
              by posting the updated Terms on the platform and updating the "Last updated" date. 
              Continued use of the service after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> parungao.johnlloyd@ue.edu.ph</p>
              <p className="text-gray-700"><strong>Platform:</strong> AI-GiR Learning Platform</p>
              <p className="text-gray-700"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ConfirmEmailPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2" />
					<CardTitle>Email Confirmation</CardTitle>
					<CardDescription>
						Please check your email inbox and click the confirmation link to activate your account.
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<p className="mb-4 text-gray-600">Once confirmed, you can sign in and start using AI-GIR.</p>
					<Link href="/signin">
						<Button variant="outline">Go to Sign In</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	)
}

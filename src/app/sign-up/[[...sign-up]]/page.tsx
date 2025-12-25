import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="auth-container">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              'bg-gradient-to-r from-[#ff9933] to-[#ff9f43] hover:opacity-90 text-[#5d4037] font-semibold',
            card: 'bg-[#2d4a3e] border-2 border-[#f5f5dc]',
            headerTitle: 'text-[#f5f5dc] font-bold',
            headerSubtitle: 'text-[#c8d6c8]',
            socialButtonsBlockButton: 
              'bg-[#1a2f1a] border-2 border-[#f5f5dc] text-[#f5f5dc] hover:bg-[#3d5a4e]',
            formFieldLabel: 'text-[#ffd93d]',
            formFieldInput: 
              'bg-[#1a2f1a] border-2 border-[#f5f5dc] text-[#f5f5dc] focus:border-[#ffd93d]',
            footerActionLink: 'text-[#ff9933] hover:text-[#ffd93d]',
          }
        }}
      />
    </div>
  )
}

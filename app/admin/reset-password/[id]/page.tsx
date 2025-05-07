import { Metadata } from 'next'
import ResetPasswordForm from '../../../components/admin/ResetPasswordForm'

type Props = {
    params: { id: string }
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Reset Password - User ${params.id}`,
        description: 'Reset user password'
    }
}

// Server Component
export default function Page({ params }: Props) {
    return <ResetPasswordForm id={params.id} />
}
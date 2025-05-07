import { Metadata } from 'next'
import UserDetailsDisplay from '../../../components/admin/UserDetailsDisplay'

type Props = {
    params: { id: string }
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `User Details - ${params.id}`,
        description: 'View user details'
    }
}
// Server Component
export default function Page({ params }: Props) {
    return <UserDetailsDisplay id={params.id} />
} 
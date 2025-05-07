import { Metadata } from 'next'
import UpdateBalanceForm from '../../../components/admin/UpdateBalanceForm'

type Props = {
    params: { id: string }
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Update Balance - User ${params.id}`,
        description: 'Update user balance'
    }
}

// Server Component
export default function Page({ params }: Props) {
    return <UpdateBalanceForm id={params.id} />
}
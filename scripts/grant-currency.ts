import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function grantCurrency() {
    try {
        // Find user by email
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    contains: 'saranshagrahari1221'
                }
            }
        }) as any

        if (!user) {
            console.log('❌ User not found with email containing: saranshagrahari1221')
            return
        }

        console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)
        console.log(`   Current ACT Currency: ${user.actCurrency}`)

        // Grant 50 ACT Currency
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                actCurrency: {
                    increment: 50
                }
            } as any
        }) as any

        console.log(`🎉 Successfully granted 50 ACT Currency!`)
        console.log(`   New ACT Currency balance: ${updated.actCurrency}`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

grantCurrency()

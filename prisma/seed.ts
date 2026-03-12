import { PrismaClient } from '@prisma/client';
import logger from '../src/logger.js';

const prisma = new PrismaClient();

async function main() {
  // Create sample job descriptions
  const jd1 = await prisma.jobDescription.create({
    data: {
      title: 'Senior Software Engineer',
      description: 'Looking for an experienced software engineer with expertise in modern web technologies.',
      rawText: `Senior Software Engineer

We are looking for a Senior Software Engineer to join our growing team.

Required Skills:
- JavaScript/TypeScript
- React
- Node.js
- 5+ years of experience

Optional Skills:
- Docker
- AWS
- GraphQL

Salary: $120,000 - $180,000

About the role:
You will be responsible for developing and maintaining web applications, mentoring junior developers, and contributing to technical architecture decisions.`,
      parsedData: {
        salary: { min: 120000, max: 180000, currency: 'USD' },
        experience: { required: 5, preferred: null },
        skills: {
          required: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
          optional: ['Docker', 'AWS', 'GraphQL']
        },
        roleSummary: 'Senior software engineering role focusing on web development and team mentorship.'
      }
    },
  });

  const jd2 = await prisma.jobDescription.create({
    data: {
      title: 'Full Stack Developer',
      description: 'Full stack developer needed for e-commerce platform development.',
      rawText: `Full Stack Developer

Join our e-commerce team as a Full Stack Developer.

Required Skills:
- Python
- Django
- PostgreSQL
- React
- 3+ years of experience

Optional Skills:
- Redis
- Kubernetes
- Vue.js

Salary: $90,000 - $140,000

About the role:
Develop and maintain our e-commerce platform, work on both frontend and backend systems, and collaborate with cross-functional teams.`,
      parsedData: {
        salary: { min: 90000, max: 140000, currency: 'USD' },
        experience: { required: 3, preferred: null },
        skills: {
          required: ['Python', 'Django', 'PostgreSQL', 'React'],
          optional: ['Redis', 'Kubernetes', 'Vue.js']
        },
        roleSummary: 'Full stack development role for e-commerce platform with focus on Python/Django backend and React frontend.'
      }
    },
  });

  logger.info('Seed data created:', { jd1, jd2 });
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

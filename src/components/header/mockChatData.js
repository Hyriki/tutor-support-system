export const MOCK_USER_STUDENT = { name: 'testStudent', id: 'user-student' };
export const MOCK_USER_TUTOR = { name: 'testTutor', id: 'user-tutor' };

export const SHARED_CHAT_ID = 'chat-student-tutor';

const createSharedChatHistory = () => [
    { sender: 'testTutor', message: 'Hello! How are you progressing with the latest assignment?', timestamp: '21/10/25 10:00' },
    { sender: 'testStudent', message: 'Hi, I am doing well. I had a question about the second part.', timestamp: '21/10/25 10:05' },
    { sender: 'testTutor', message: 'Of course, what is it?', timestamp: '21/10/25 10:06' },
];

export const initialData = {
    [MOCK_USER_STUDENT.id]: [
        {
            id: SHARED_CHAT_ID,
            contactName: 'testTutor',
            lastMessage: 'Of course, what is it?',
            lastMessageDate: '21/10/25',
            fullHistory: createSharedChatHistory(),
            unread: false,
            avatarColor: 'bg-green-200',
            avatarTextColor: 'text-green-700',
            avatarText: 'TT'
        },
        {
            id: 'chat-student1',
            contactName: 'student1',
            lastMessage: 'Hey, are you going to the study group tonight?',
            lastMessageDate: '20/10/25',
            fullHistory: [
                { sender: 'student1', message: 'Hey, are you going to the study group tonight?', timestamp: '20/10/25 18:00' }
            ],
            unread: true,
            avatarColor: 'bg-purple-200',
            avatarTextColor: 'text-purple-700',
            avatarText: 'S1'
        },
        {
            id: 'chat-academic-office-student',
            contactName: 'Academic office',
            lastMessage: 'Reminder: Course registration deadline is this Friday.',
            lastMessageDate: '19/10/25',
            fullHistory: [
                { sender: 'Academic office', message: 'Reminder: Course registration deadline is this Friday.', timestamp: '19/10/25 09:00' }
            ],
            unread: false,
            avatarColor: 'bg-red-200',
            avatarTextColor: 'text-red-700',
            avatarText: 'AO'
        },
        {
            id: 'chat-student3',
            contactName: 'student3',
            lastMessage: 'Can we reschedule our meeting?',
            lastMessageDate: '15/10/25',
            fullHistory: [
                { sender: 'student3', message: 'Hi, something came up. Can we reschedule our meeting?', timestamp: '15/10/25 11:00' }
            ],
            unread: true,
            avatarColor: 'bg-pink-200',
            avatarTextColor: 'text-pink-700',
            avatarText: 'S3'
        },
        {
            id: 'chat-student-tutor3',
            contactName: 'tutor3',
            lastMessage: 'Yes, that is correct. Good job.',
            lastMessageDate: '12/10/25',
            fullHistory: [
                { sender: 'testStudent', message: 'Is this the right approach for the problem?', timestamp: '12/10/25 14:00' },
                { sender: 'tutor3', message: 'Yes, that is correct. Good job.', timestamp: '12/10/25 14:05' }
            ],
            unread: false,
            avatarColor: 'bg-blue-200',
            avatarTextColor: 'text-blue-700',
            avatarText: 'T3'
        },
        {
            id: 'chat-student-tutor4',
            contactName: 'tutor4',
            lastMessage: 'I will be holding extra office hours this week.',
            lastMessageDate: '11/10/25',
            fullHistory: [
                { sender: 'tutor4', message: 'For anyone struggling with the material, I will be holding extra office hours this week.', timestamp: '11/10/25 09:30' }
            ],
            unread: false,
            avatarColor: 'bg-indigo-200',
            avatarTextColor: 'text-indigo-700',
            avatarText: 'T4'
        }
    ],
    [MOCK_USER_TUTOR.id]: [
        {
            id: SHARED_CHAT_ID,
            contactName: 'testStudent',
            lastMessage: 'Of course, what is it?',
            lastMessageDate: '21/10/25',
            fullHistory: createSharedChatHistory(),
            unread: true, // Unread for the tutor
            avatarColor: 'bg-cyan-200',
            avatarTextColor: 'text-cyan-700',
            avatarText: 'TS'
        },
        {
            id: 'chat-student2',
            contactName: 'student2',
            lastMessage: 'Thank you for the feedback on my draft!',
            lastMessageDate: '18/10/25',
            fullHistory: [
                { sender: MOCK_USER_TUTOR.name, message: 'I have reviewed your draft. Please see my comments.', timestamp: '18/10/25 14:00' },
                { sender: 'student2', message: 'Thank you for the feedback on my draft!', timestamp: '18/10/25 15:30' }
            ],
            unread: false,
            avatarColor: 'bg-yellow-200',
            avatarTextColor: 'text-yellow-700',
            avatarText: 'S2'
        },
        {
            id: 'chat-academic-office-tutor',
            contactName: 'Academic office',
            lastMessage: 'Please submit your student progress reports by EOD.',
            lastMessageDate: '17/10/25',
            fullHistory: [
                { sender: 'Academic office', message: 'Please submit your student progress reports by EOD.', timestamp: '17/10/25 11:00' }
            ],
            unread: false,
            avatarColor: 'bg-red-200',
            avatarTextColor: 'text-red-700',
            avatarText: 'AO'
        },
        {
            id: 'chat-student4',
            contactName: 'student4',
            lastMessage: 'I have submitted my essay.',
            lastMessageDate: '14/10/25',
            fullHistory: [
                { sender: 'student4', message: 'Dear Tutor, I have submitted my essay for review.', timestamp: '14/10/25 16:20' }
            ],
            unread: false,
            avatarColor: 'bg-orange-200',
            avatarTextColor: 'text-orange-700',
            avatarText: 'S4'
        },
        {
            id: 'chat-student5',
            contactName: 'student5',
            lastMessage: 'Got it, thanks!',
            lastMessageDate: '13/10/25',
            fullHistory: [
                { sender: MOCK_USER_TUTOR.name, message: 'Please check the updated syllabus in the portal.', timestamp: '13/10/25 09:00' },
                { sender: 'student5', message: 'Got it, thanks!', timestamp: '13/10/25 09:05' }
            ],
            unread: false,
            avatarColor: 'bg-teal-200',
            avatarTextColor: 'text-teal-700',
            avatarText: 'S5'
        },
        {
            id: 'chat-tutor-student6',
            contactName: 'student6',
            lastMessage: 'I need help with the last question.',
            lastMessageDate: '12/10/25',
            fullHistory: [
                { sender: 'student6', message: 'Hi tutor, I am stuck. I need help with the last question.', timestamp: '12/10/25 19:00' }
            ],
            unread: true,
            avatarColor: 'bg-gray-200',
            avatarTextColor: 'text-gray-700',
            avatarText: 'S6'
        },
        {
            id: 'chat-tutor-student7',
            contactName: 'student7',
            lastMessage: 'Thank you!',
            lastMessageDate: '11/10/25',
            fullHistory: [
                { sender: MOCK_USER_TUTOR.name, message: 'Your presentation was excellent.', timestamp: '11/10/25 13:00' },
                { sender: 'student7', message: 'Thank you!', timestamp: '11/10/25 13:02' }
            ],
            unread: false,
            avatarColor: 'bg-lime-200',
            avatarTextColor: 'text-lime-700',
            avatarText: 'S7'
        },
    ]
};
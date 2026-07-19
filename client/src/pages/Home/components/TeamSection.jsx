import { TEAM_MEMBERS } from 'pages/Home/constants/homeContent';
import SocialLinks from './SocialLinks';
import SvgIcon from './SvgIcon';

export default function TeamSection({ t }) {
  return (
    <section className="flex flex-col items-center justify-center pt-10 pb-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          {t('home.team.title')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {t('home.team.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

function TeamMemberCard({ member }) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-2xl opacity-50 group-hover:opacity-75 transition-opacity" />

      <div className="relative flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-800 ring-2 ring-primary/20 dark:ring-primary/40">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800">
            <SvgIcon
              path="M5 13l4 4L19 7"
              className="w-3 h-3"
              strokeWidth={3}
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {member.name}
        </h3>
        <p className="text-primary font-medium text-sm mb-3 uppercase tracking-wider">
          {member.role}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center italic">
          &quot;{member.quote}&quot;
        </p>

        <SocialLinks />
      </div>
    </div>
  );
}

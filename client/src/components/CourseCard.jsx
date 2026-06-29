import { Star, Users } from 'lucide-react';

const difficultyLabel = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function CourseCard({
  course,
  onClick,
  onBookmark,
  isBookmarked = false,
  showBookmark = true,
  reviewCount,
  enrollmentCount,
}) {
  const thumb = course.thumbnail;
  const enrollments = enrollmentCount ?? course._count?.enrollments ?? 0;
  const reviews = reviewCount ?? course._count?.reviews ?? 0;

  return (
    <article
      className="sh-card flex flex-col h-full cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] bg-[#2d2f31] overflow-hidden">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-medium px-4 text-center">
            {course.category}
          </div>
        )}
        {showBookmark && onBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(course.id);
            }}
            className="absolute top-2 right-2 bg-white border border-[#d1d7dc] px-2 py-1 text-xs font-bold hover:bg-[#f7f9fa]"
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-[#1c1d1f] text-[15px] leading-snug line-clamp-2 mb-1 group-hover:text-[#5624d0]">
          {course.title}
        </h3>
        <p className="text-xs sh-muted mb-2 line-clamp-1">
          {course.teacher?.name || 'Community teacher'}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between text-xs sh-muted">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-[#e59819]" fill="#e59819" />
            {reviews} reviews
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {enrollments}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          <span className="sh-badge">{difficultyLabel[course.difficulty] || course.difficulty}</span>
        </div>
      </div>
    </article>
  );
}

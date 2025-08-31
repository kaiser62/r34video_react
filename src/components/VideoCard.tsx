import Image from "next/image";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  is_hd?: string;
  duration?: string;
}

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-gray-600"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-gray-700">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No Thumbnail</span>
          </div>
        )}
        
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
        
        {video.is_hd && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            HD
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-100 line-clamp-2 leading-tight">
          {video.title}
        </h3>
      </div>
    </div>
  );
}
import { youTubeEmbedUrl } from '@/lib/youtube'

/** 동영상 게시물 상단에 표시하는 반응형(16:9) 유튜브 플레이어. */
export function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="relative mb-8 w-full aspect-video overflow-hidden rounded-xl bg-black shadow-sm">
      <iframe
        src={youTubeEmbedUrl(videoId)}
        title={title ?? 'YouTube 영상'}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}

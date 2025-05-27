import { ImageResponse } from 'next/og'

// 이미지 메타데이터
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// 아이콘 생성 함수
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX 요소
      <div
        style={{
          fontSize: 24,
          background: '#000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          borderRadius: '4px',
        }}
      >
        📝
      </div>
    ),
    // ImageResponse 옵션
    {
      ...size,
    }
  )
} 
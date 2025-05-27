/**
 * 마크다운 콘텐츠 렌더링 컴포넌트
 * GitHub Flavored Markdown과 코드 하이라이팅을 지원하는 렌더러
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Components } from 'react-markdown';

// 코드 하이라이팅 CSS 스타일 임포트
import 'highlight.js/styles/github-dark.css';

/**
 * MarkdownContent 컴포넌트의 Props 인터페이스
 */
interface MarkdownContentProps {
  /** 렌더링할 마크다운 콘텐츠 */
  content: string;
  /** 컨테이너 클래스명 */
  className?: string;
  /** 이미지 최적화 옵션 */
  optimizeImages?: boolean;
  /** 외부 링크에 보안 속성 추가 */
  secureLlinks?: boolean;
  /** 목차 생성을 위한 ID 추가 */
  enableTableOfContents?: boolean;
  /** 텍스트 크기 변형 */
  size?: 'sm' | 'base' | 'lg' | 'xl';
}

/**
 * 커스텀 링크 컴포넌트
 * 내부 링크는 Next.js Link, 외부 링크는 보안 속성 추가
 */
function CustomLink({ href, children, ...props }: any) {
  // 내부 링크 판별
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));
  
  if (isInternalLink) {
    return (
      <Link 
        href={href} 
        className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  // 외부 링크
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors inline-flex items-center gap-1"
      {...props}
    >
      {children}
      <span className="text-xs opacity-70">↗</span>
    </a>
  );
}

/**
 * 커스텀 이미지 컴포넌트
 * Next.js Image를 활용한 최적화된 이미지 렌더링
 */
function CustomImage({ src, alt, title, ...props }: any) {
  if (!src) return null;
  
  // 외부 이미지는 일반 img 태그 사용
  if (src.startsWith('http')) {
    return (
      <img
        src={src}
        alt={alt || ''}
        title={title}
        className="rounded-lg shadow-md max-w-full h-auto"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'flex items-center justify-center bg-muted rounded-lg p-8 text-muted-foreground';
          placeholder.innerHTML = '🖼️ 이미지를 불러올 수 없습니다';
          e.currentTarget.parentNode?.insertBefore(placeholder, e.currentTarget);
        }}
        {...props}
      />
    );
  }
  
  // 내부 이미지는 Next.js Image 컴포넌트 사용
  return (
    <div className="relative my-8">
      <Image
        src={src}
        alt={alt || ''}
        title={title}
        width={800}
        height={400}
        className="rounded-lg shadow-md"
        style={{ width: '100%', height: 'auto' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'flex items-center justify-center bg-muted rounded-lg p-8 text-muted-foreground h-40';
          placeholder.innerHTML = '🖼️ 이미지를 불러올 수 없습니다';
          e.currentTarget.parentNode?.insertBefore(placeholder, e.currentTarget);
        }}
        {...props}
      />
    </div>
  );
}

/**
 * 커스텀 코드 블록 컴포넌트
 * 언어별 구문 강조 및 복사 기능
 */
function CustomCode({ inline, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  if (inline) {
    return (
      <code 
        className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-sm font-mono border"
        {...props}
      >
        {children}
      </code>
    );
  }
  
  return (
    <div className="relative group my-6">
      {/* 언어 표시 */}
      {language && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-muted/80 rounded text-xs text-muted-foreground font-mono">
          {language}
        </div>
      )}
      
      {/* 코드 블록 */}
      <pre className="overflow-x-auto p-4 rounded-lg bg-muted border text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/**
 * 커스텀 테이블 컴포넌트
 * 반응형 테이블 스타일링
 */
function CustomTable({ children }: any) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-border">
        {children}
      </table>
    </div>
  );
}

/**
 * 마크다운 컴포넌트 맵핑
 */
function createComponents(props: MarkdownContentProps): Components {
  return {
    // 제목 태그들
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-12 mb-6 first:mt-0 pb-3 border-b border-border">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-10 mb-5 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mt-8 mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-3">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-base font-semibold mt-4 mb-2">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-semibold mt-4 mb-2 text-muted-foreground">
        {children}
      </h6>
    ),
    
    // 단락 및 텍스트
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-foreground">
        {children}
      </p>
    ),
    
    // 링크
    a: (linkProps) => <CustomLink {...linkProps} />,
    
    // 이미지
    img: (imageProps) => props.optimizeImages ? 
      <CustomImage {...imageProps} /> : 
      <img {...imageProps} className="rounded-lg shadow-md max-w-full h-auto" />,
    
    // 코드
    code: CustomCode,
    
    // 인용문
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 bg-muted/30 italic">
        <div className="text-muted-foreground">
          {children}
        </div>
      </blockquote>
    ),
    
    // 목록들
    ul: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    
    // 테이블
    table: CustomTable,
    thead: ({ children }) => (
      <thead className="bg-muted/50">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/30 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm">
        {children}
      </td>
    ),
    
    // 구분선
    hr: () => (
      <hr className="my-8 border-border" />
    ),
    
    // 강조
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-muted-foreground">
        {children}
      </em>
    ),
    
    // 취소선
    del: ({ children }) => (
      <del className="line-through text-muted-foreground">
        {children}
      </del>
    ),
    
    // 체크박스 (GFM)
    input: ({ type, checked, ...inputProps }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            disabled
            className="mr-2 accent-primary"
            {...inputProps}
          />
        );
      }
      return <input type={type} {...inputProps} />;
    },
  };
}

/**
 * 마크다운 콘텐츠 렌더링 컴포넌트
 */
export const MarkdownContent = memo<MarkdownContentProps>(function MarkdownContent({
  content,
  className = '',
  optimizeImages = true,
  secureLlinks = true,
  enableTableOfContents = false,
  size = 'base',
}) {
  // 크기별 클래스 정의
  const sizeClasses = {
    sm: 'prose-sm',
    base: 'prose',
    lg: 'prose-lg',
    xl: 'prose-xl',
  };
  
  // remark 플러그인들
  const remarkPlugins = [
    remarkGfm, // GitHub Flavored Markdown
    remarkBreaks, // 줄바꿈 지원
  ];
  
  // rehype 플러그인들
  const rehypePlugins = [
    rehypeHighlight, // 코드 하이라이팅
    ...(enableTableOfContents ? [
      rehypeSlug, // 헤딩에 ID 추가
      [rehypeAutolinkHeadings, { behavior: 'wrap' }], // 헤딩 링크 생성
    ] : []),
  ];
  
  return (
    <div 
      className={`
        ${sizeClasses[size]}
        prose-headings:font-bold
        prose-headings:text-foreground
        prose-p:text-foreground
        prose-strong:text-foreground
        prose-code:text-sm
        prose-pre:bg-muted
        prose-pre:border
        prose-pre:border-border
        max-w-none
        dark:prose-invert
        ${className}
      `}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={createComponents({ 
          content, 
          optimizeImages, 
          secureLlinks, 
          enableTableOfContents, 
          size 
        })}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownContent; 
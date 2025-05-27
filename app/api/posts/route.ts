import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
    createServerClient,
    createClerkSupabaseServerClient,
} from '@/lib/supabase-server';
import { Database } from '@/types/database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];

// GET: 모든 게시물 조회 (페이지네이션 포함)
export async function GET() {
    try {
        const supabase = createServerClient();

        const { data: posts, error } = await supabase
            .from('posts')
            .select(
                `
        id,
        title,
        slug,
        status,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `
            )
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('포스트 조회 오류:', error);
            return NextResponse.json(
                { error: '포스트 조회 실패' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            posts: posts || [],
            count: posts?.length || 0,
        });
    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

// POST: 새 게시물 생성 (Clerk 인증 필수)
export async function POST(request: NextRequest) {
    try {
        console.log('=== 게시물 생성 API 호출 ===');

        // Clerk 인증 확인
        const { userId } = await auth();
        console.log('Clerk 사용자 ID:', userId);

        if (!userId) {
            console.log('❌ 인증 실패: 사용자 ID가 없음');
            return NextResponse.json(
                { error: '인증이 필요합니다' },
                { status: 401 }
            );
        }

        // 중요: Clerk 토큰이 포함된 Supabase 클라이언트 생성
        const supabase = await createClerkSupabaseServerClient(request);

        if (!supabase) {
            console.log('❌ Supabase 클라이언트 생성 실패');
            return NextResponse.json(
                { error: 'Supabase 인증에 실패했습니다' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log('요청 데이터:', body);

        const {
            title,
            content,
            slug,
            coverImageUrl,
            cover_image_url,
            categoryId,
            category_id,
        } = body;

        // 필수 필드 검증
        if (!title || !content || !slug) {
            console.log('❌ 필수 필드 누락:', {
                title: !!title,
                content: !!content,
                slug: !!slug,
            });
            return NextResponse.json(
                { error: '제목, 내용, 슬러그는 필수입니다' },
                { status: 400 }
            );
        }

        // 슬러그 중복 확인
        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existingPost) {
            return NextResponse.json(
                { error: '이미 사용 중인 슬러그입니다' },
                { status: 400 }
            );
        }

        // 새 게시물 생성 - 필드명 정규화 및 "none" 처리
        const newPost: PostInsert = {
            title,
            content,
            slug,
            // coverImageUrl 또는 cover_image_url 처리
            cover_image_url: coverImageUrl || cover_image_url || null,
            // categoryId가 "none"이면 null로 변환
            category_id:
                categoryId === 'none' || category_id === 'none'
                    ? null
                    : categoryId || category_id || null,
            author_id: userId,
        };

        console.log('💾 Supabase에 게시물 삽입 시도:', newPost);

        const { data: post, error } = await supabase
            .from('posts')
            .insert(newPost)
            .select(
                `
        *,
        categories (
          id,
          name,
          slug
        )
      `
            )
            .single();

        if (error) {
            console.error('게시물 생성 오류:', error);
            console.error('오류 상세:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
            });
            return NextResponse.json(
                { error: `게시물 생성에 실패했습니다: ${error.message}` },
                { status: 500 }
            );
        }

        console.log('✅ 게시물 생성 성공:', post);
        return NextResponse.json(
            { post, message: '게시물이 성공적으로 생성되었습니다' },
            { status: 201 }
        );
    } catch (error) {
        console.error('게시물 생성 중 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

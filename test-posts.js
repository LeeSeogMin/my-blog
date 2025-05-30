// Simple test script to check what posts exist in the database
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
  console.log('🔍 Checking posts in database...');
  
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, status, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }

    console.log(`✅ Found ${posts?.length || 0} published posts:`);
    
    if (posts && posts.length > 0) {
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   URL: http://localhost:3003/posts/${post.slug}`);
        console.log(`   Created: ${post.created_at}`);
        console.log('---');
      });
    } else {
      console.log('📄 No published posts found in database');
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

checkPosts();

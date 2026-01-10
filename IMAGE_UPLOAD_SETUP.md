# Image Upload Setup Guide

## Overview

The image upload system uses Supabase Storage with secure server-side uploads. All uploads happen on the server using the service role key, which is never exposed to the client.

## Environment Variables

Add the following to your `.env` file:

```env
# Supabase Configuration (already exists)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Required for server-side image uploads
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting the Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to Settings → API
3. Copy the "service_role" key (NOT the anon key)
4. Add it to your `.env` file

**⚠️ IMPORTANT:** Never commit the service role key to version control. It has admin access to your Supabase project.

## Supabase Storage Setup

### 1. Create the Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `techverse`
4. Make it **Public** (so images are publicly accessible)
5. Click "Create bucket"

### 2. Set Up Storage Policies (Optional but Recommended)

For additional security, you can set up Row Level Security policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'techverse');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'techverse');
```

## Storage Structure

Images are stored in the following structure:

```
techverse/
 └── books/
     └── {bookId}/
         └── {timestamp}-{originalFilename}
```

Example:
```
techverse/books/550e8400-e29b-41d4-a716-446655440000/1704067200000-book-cover.jpg
```

## Usage

### In the Add Book Page

1. Select one or multiple images
2. Click "Upload Images" to upload them to Supabase
3. Images will be uploaded to `techverse/books/temp/` initially
4. After book creation, images are associated with the book via URLs stored in the database

### API Endpoint

```typescript
POST /api/upload/images?bookId={uuid}

// FormData with 'images' field (FileList)
const formData = new FormData()
formData.append('images', file1)
formData.append('images', file2)

const response = await fetch('/api/upload/images?bookId=temp', {
  method: 'POST',
  body: formData,
})
```

## Security Features

- ✅ Server-side uploads only (service role key never exposed)
- ✅ Authentication required (NextAuth session)
- ✅ File type validation (images only)
- ✅ File size limit (5MB per image)
- ✅ Unique filenames (timestamp prevents conflicts)
- ✅ Public URLs stored in database (not storage paths)

## Testing

1. **Test Authentication**: Try uploading without being logged in (should fail)
2. **Test File Validation**: Try uploading non-image files (should fail)
3. **Test Size Limit**: Try uploading files > 5MB (should fail)
4. **Test Upload Flow**: 
   - Log in
   - Go to `/add-book`
   - Select images
   - Upload images
   - Verify images appear in preview
   - Submit book form
   - Verify book appears with images on `/books` page

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- Add the service role key to your `.env` file
- Restart your dev server

### "Bucket not found"
- Create the `techverse` bucket in Supabase Dashboard
- Make sure it's set to Public

### "Upload failed"
- Check Supabase Dashboard → Storage → `techverse` bucket
- Verify bucket policies allow uploads
- Check browser console for detailed error messages

### Images not displaying
- Verify bucket is set to Public
- Check image URLs in database
- Verify images exist in Supabase Storage

## Future Enhancements

- Move images from `temp/` to actual `bookId/` after book creation
- Add image deletion when book is deleted
- Add image compression before upload
- Add progress indicators for large uploads


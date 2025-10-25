# Testing PollSync Locally

## Quick Setup for Testing

### Option 1: Disable Email Confirmation (Fastest for Testing)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your `pollsync` project
3. Navigate to **Authentication** → **Providers** → **Email**
4. **Disable** "Confirm email"
5. Click **Save**

Now you can sign up and immediately start using the app without email confirmation!

### Option 2: Confirm Email Manually (If you want to keep confirmation enabled)

1. Sign up with your email in the app
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Find your user in the list
4. Click the three dots (•••) on your user
5. Select **Confirm email**
6. Now you can log in and create polls!

### Option 3: Check Email (Production-like)

If you're using a real email address and want to test the full flow:
1. Sign up in the app
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Log in to the app

## Testing Checklist

### ✅ Admin Flow

1. **Sign Up/Login**
   ```
   - Go to http://localhost:3000
   - Click "Create a Poll"
   - Sign up with email/password
   - Confirm email (see options above)
   - Log in
   ```

2. **Create a Poll**
   ```
   - Click "Create New Poll"
   - Enter title: "What's your favorite color?"
   - Add options:
     * Red
     * Blue
     * Green
     * Yellow
   - Drag options to reorder (optional)
   - Click "Create Poll"
   - Note the access code (e.g., AB12-34)
   ```

3. **View Dashboard**
   ```
   - Should see your poll listed
   - Check the access code
   - Click "View Results"
   - Initially shows 0 votes
   ```

### ✅ Voter Flow

1. **Enter Code**
   ```
   - Open http://localhost:3000 in incognito/private window
   - Click "I Have a Code"
   - Enter the access code from admin
   - Click "Continue to Poll"
   ```

2. **Vote**
   ```
   - Enter your name (e.g., "John")
   - Select an option (e.g., "Blue")
   - Click "Submit Vote"
   - Redirected to results page
   ```

3. **View Results**
   ```
   - See your vote counted
   - Toggle between bar and pie charts
   - Results show percentages
   ```

### ✅ Real-time Updates

1. **Admin View**
   ```
   - Keep admin results page open
   - Have another person vote (or use incognito)
   - Watch results update automatically
   - No page refresh needed!
   ```

2. **Test Multiple Voters**
   ```
   - Use different browsers/devices
   - Each can vote once with the same code
   - Results update in real-time for everyone
   ```

### ✅ Duplicate Vote Prevention

1. **Try to Vote Twice**
   ```
   - Vote once
   - Go back to voting page
   - Try to vote again
   - Should see error: "You have already voted"
   ```

2. **Different Devices**
   ```
   - Vote from Computer
   - Vote from Phone
   - Both votes should count
   - Each device tracked separately
   ```

## Common Issues

### "Unauthorized" Error

**Symptom**: When creating poll, get 401 error

**Solutions**:
1. Make sure you're logged in (check if you see "Dashboard" in navbar)
2. Clear browser cookies and log in again
3. Confirm your email (see options above)
4. Check browser console for detailed errors

### "Invalid Access Code"

**Symptom**: Code entry says code is invalid

**Solutions**:
1. Check code format: XX XX-XX (e.g., AB12-34)
2. Code is case-insensitive but must match exactly
3. Make sure poll wasn't deleted
4. Copy code from admin dashboard (don't type manually)

### Real-time Not Working

**Symptom**: Results don't update automatically

**Solutions**:
1. Check browser console for errors
2. Make sure Supabase Realtime is enabled
3. Refresh the page
4. Check your Supabase project is active

### Can't Log In After Signup

**Symptom**: Signed up but can't log in

**Solutions**:
1. Check if email confirmation is required
2. Look for confirmation email (check spam)
3. Or disable email confirmation in Supabase
4. Try password reset if needed

## Test Scenarios

### Scenario 1: Basic Poll
```
Title: "Best Programming Language?"
Options: JavaScript, Python, Go, Rust
Expected: 4 options in order, all work correctly
```

### Scenario 2: Poll with Description
```
Title: "Where should we have lunch?"
Description: "Team lunch for Friday. Vote for your preference!"
Options: Italian, Chinese, Mexican, American
Expected: Description shows on voting page
```

### Scenario 3: Reordered Options
```
Title: "Experience Level"
Options (drag to order): Beginner, Intermediate, Advanced, Expert
Expected: Options appear in custom order
```

### Scenario 4: Real-time Test
```
1. Create poll
2. Open results in Tab 1 (admin)
3. Open voting in Tab 2 (incognito)
4. Vote in Tab 2
5. Watch Tab 1 update automatically
Expected: No refresh needed, instant update
```

### Scenario 5: Multiple Voters
```
1. Get 3-5 people/devices
2. All use same access code
3. Everyone votes for different options
4. Admin sees all votes
5. Admin sees all voter names
Expected: Real-time updates, all votes counted
```

## Performance Testing

### Load Test (Optional)
```bash
# Simulate 100 votes (requires testing tools)
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/polls/POLL_ID/vote \
    -H "Content-Type: application/json" \
    -d "{\"option_id\":\"OPTION_ID\",\"voter_uuid\":\"test-$i\",\"voter_name\":\"Voter $i\"}"
done
```

## Debugging Tips

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** in sidebar
3. Select **API** or **Auth**
4. Look for errors related to your requests

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to create poll/vote
4. Look at API request/response
5. Check status codes and error messages

### Check Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Copy and search online if unclear

## Next Steps

Once everything works locally:
1. ✅ Test all features
2. ✅ Fix any bugs
3. ✅ Deploy to Vercel (see DEPLOYMENT.md)
4. ✅ Test production version
5. ✅ Share with real users!

## Need Help?

- Check main README.md for feature documentation
- See DEPLOYMENT.md for production setup
- Look at Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs

Happy testing! 🎉



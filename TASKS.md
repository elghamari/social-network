# 📊 Database Schema & Ownership

**Project:** Social Network Platform  
**Total Tables:** 15  
**Last Updated:** 2024

---

## 👤 melbouab – User & Social Graph

### 1. `users`
**Columns:**
- `id`
- `email`
- `password_hash`
- `first_name`
- `last_name`
- `dob`
- `nickname`
- `about_me`
- `is_public`
- `session_token`
- `session_expires_at`
- `created_at`

**Notes:** Session integrated into user table

---

### 2. `follow_requests`
**Columns:**
- `id`
- `sender_id`
- `recipient_id`
- `status`
- `created_at`

**Notes:** `status = PENDING / ACCEPTED / DECLINED`

---

### 3. `followers`
**Columns:**
- `id`
- `follower_id`
- `following_id`
- `created_at`

**Notes:** Created only when a request is accepted

---

✅ **All tables above owned by melbouab**

---

## 🖼️ aouterga – Content & Media

### 4. `media`
**Columns:**
- `id`
- `owner_id`
- `model_type`
- `path`
- `mime_type`
- `created_at`

**Notes:** Single table for ALL images (`model_type = user / post / comment`)

---

### 5. `posts`
**Columns:**
- `id`
- `user_id`
- `group_id`
- `content`
- `privacy`
- `created_at`

**Notes:** `group_id = NULL` → normal post, `NOT NULL` → group post

---

### 6. `comments`
**Columns:**
- `id`
- `user_id`
- `post_id`
- `content`
- `created_at`

---

✅ **All tables above owned by aouterga**

---

## 👥 mmarhror – Groups & Events

### 7. `groups`
**Columns:**
- `id`
- `creator_id`
- `title`
- `description`
- `created_at`

---

### 8. `group_members`
**Columns:**
- `id`
- `group_id`
- `user_id`
- `role`
- `created_at`

**Notes:** `role = MEMBER / CREATOR`

---

### 9. `group_invitations`
**Columns:**
- `id`
- `group_id`
- `inviter_id`
- `user_id`
- `status`
- `created_at`

---

### 10. `group_join_requests`
**Columns:**
- `id`
- `group_id`
- `user_id`
- `status`
- `created_at`

---

### 11. `events`
**Columns:**
- `id`
- `group_id`
- `creator_id`
- `title`
- `description`
- `event_time`
- `created_at`

---

### 12. `event_rsvps`
**Columns:**
- `id`
- `event_id`
- `user_id`
- `status`
- `created_at`

**Notes:** `status = GOING / NOT_GOING`

---

✅ **All tables above owned by mmarhror**

---

## 💬 elghamari – Messaging & Notifications

### 13. `private_messages`
**Columns:**
- `id`
- `sender_id`
- `recipient_id`
- `content`
- `read_at`
- `created_at`

---

### 14. `group_messages`
**Columns:**
- `id`
- `group_id`
- `user_id`
- `content`
- `created_at`

---

### 15. `notifications`
**Columns:**
- `id`
- `user_id`
- `type`
- `source_id`
- `read_at`
- `created_at`

**Notes:** `type = follow_request / group_invite / event / etc`

---

✅ **All tables above owned by elghamari**

---

## 📦 Summary

| Owner      | Responsibility              | Tables Count |
|------------|----------------------------|--------------|
| melbouab   | User & Social Graph        | 3            |
| aouterga   | Content & Media            | 3            |
| mmarhror   | Groups & Events            | 6            |
| elghamari  | Messaging & Notifications  | 3            |
| **Total**  |                            | **15**       |

---

## 📝 Notes

- Previously had 16 tables, optimized to 15
- Sessions integrated into `users` table
- Single `media` table serves all image needs (polymorphic design)
- Clear ownership boundaries for parallel development

---

**End of Document**
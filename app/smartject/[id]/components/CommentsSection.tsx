import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  comment: string;
  setComment: (comment: string) => void;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onSubmitComment: (e: React.FormEvent) => void;
}

export function CommentsSection({
  comments,
  comment,
  setComment,
  isAuthenticated,
  isSubmitting,
  onSubmitComment,
}: CommentsSectionProps) {
  return (
    <div>
      <div className="space-y-4">
        {isAuthenticated ? (
          <form onSubmit={onSubmitComment}>
            <div className="space-y-4">
              <Textarea
                placeholder="Add your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-yellow-300 hover:bg-yellow-400 text-black"
                  disabled={!comment.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-muted/50">
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-muted-foreground mb-4">
                Please log in to join the discussion
              </p>
              <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Link href="/auth/login">Log In</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-4 p-4 border-b rounded-lg"
              >
                <Avatar>
                  <AvatarImage
                    src={comment.user?.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {comment.user?.name.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">
                      {comment.user?.name || "Anonymous"}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

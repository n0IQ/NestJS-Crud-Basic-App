import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });

    return {
      status: 'success',
      message: 'All Bookmarks are fetched successfully',
      data: {
        bookmarks,
      },
    };
  }

  async getBookmark(bookmarkId: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    return {
      status: 'success',
      message: 'Bookmark is fetched successfully',
      data: {
        bookmark,
      },
    };
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const newBookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return {
      status: 'success',
      message: 'Bookmark created successfully',
      data: {
        newBookmark,
      },
    };
  }

  async updateBookmark(
    bookmarkId: number,
    userId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // Bookmark doesn't exist
    if (!bookmark) {
      throw new ForbiddenException('No bookmark of this ID exists!');
    }

    // Bookmark doesn't belong to this user
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access to this Bookmark denied!');
    }

    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });

    return {
      status: 'success',
      message: 'Bookmark updated successfully',
      data: {
        updatedBookmark,
      },
    };
  }

  async deleteBookmark(bookmarkId: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // Bookmark doesn't exist
    if (!bookmark) {
      throw new ForbiddenException('No bookmark of this ID exists!');
    }

    // Bookmark doesn't belong to this user
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access to this Bookmark denied!');
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });

    return {
      status: 'success',
      message: 'Bookmark deleted successfully',
      data: null,
    };
  }
}

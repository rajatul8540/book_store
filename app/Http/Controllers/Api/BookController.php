<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(
            max((int) $request->query('per_page', 10), 1),
            100
        );

        $search = trim((string) $request->query('search', ''));

        $books = Book::query()
            ->where('_deleted', false)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage);

        $data = [];

        foreach ($books as $book) {
            $data[] = $this->bookValue($book, $request);
        }

        return $this->successResponse(
            'Books fetched successfully',
            [
                'current_page' => $books->currentPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
                'last_page' => $books->lastPage(),
                'data' => $data,
            ]
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make(
            $request->all(),
            $this->validationRules(),
            $this->validationMessages()
        );

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation error',
                $validator->errors(),
                422
            );
        }

        $data = $validator->validated();

        $coverImage = $this->resolveCoverImage($request);

        if ($request->hasFile('cover_image') && !$coverImage) {
            return $this->errorResponse(
                'Unable to upload cover image',
                null,
                500
            );
        }

        $data['cover_image'] = $coverImage;

        $book = Book::create($data);

        return $this->successResponse(
            'Book created successfully',
            $this->bookValue($book, $request),
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $book = $this->findBook($id);

        if (!$book) {
            return $this->errorResponse(
                'Book not found',
                null,
                404
            );
        }

        return $this->successResponse(
            'Book fetched successfully',
            $this->bookValue($book, $request)
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $book = $this->findBook($id);


        if (!$book) {
            return $this->errorResponse(
                'Book not found',
                null,
                404
            );
        }

        $validator = Validator::make(
            $request->all(),
            $this->updateValidationRules(),
            $this->validationMessages()
        );

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation error',
                $validator->errors(),
                422
            );
        }

        $data = $validator->validated();

        if ($request->hasFile('cover_image')) {

            $coverImage = $this->resolveCoverImage($request);

            if (!$coverImage) {
                return $this->errorResponse(
                    'Unable to upload cover image',
                    null,
                    500
                );
            }

            $this->deleteCoverImage($book->cover_image);

            $data['cover_image'] = $coverImage;
        }

        $book->update($data);

        return $this->successResponse(
            'Book updated successfully',
            $this->bookValue($book->fresh(), $request)
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $book = $this->findBook($id);

        if (!$book) {
            return $this->errorResponse(
                'Book not found',
                null,
                404
            );
        }

        $book->update([
            '_deleted' => true
        ]);

        return $this->successResponse(
            'Book deleted successfully',
            $this->bookValue($book->fresh(), $request)
        );
    }

    private function findBook(int $id): ?Book
    {
        return Book::where('_deleted', false)->find($id);
    }

    private function validationRules(): array
    {
        return [
            'title'          => 'required|string|max:255',
            'author'         => 'required|string|max:255',
            'cover_image'    => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price'          => 'required|numeric|min:0',
            'published_date' => 'nullable|date',
        ];
    }

    private function updateValidationRules(): array
    {
        return [
            'title'          => 'sometimes|required|string|max:255',
            'author'         => 'sometimes|required|string|max:255',
            'cover_image'    => 'sometimes|required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price'          => 'sometimes|required|numeric|min:0',
            'published_date' => 'sometimes|required|date',
        ];
    }

    private function validationMessages(): array
    {
        return [
            'cover_image.image' => 'Cover image must be a valid image file',
            'cover_image.mimes' => 'Cover image must be jpg, jpeg, png, or webp',
            'cover_image.max'   => 'Cover image must be 2MB or smaller',
        ];
    }

    private function resolveCoverImage(Request $request): ?string
    {
        if ($request->hasFile('cover_image')) {
            return $request->file('cover_image')
                ->store('books', 'public');
        }

        return $request->input('cover_image');
    }

    private function bookValue(Book $book, Request $request): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'cover_image' => $book->cover_image,
            'cover_image_url' => $this->coverImageUrl($book, $request),
            'price' => $book->price,
            'published_date' => $book->published_date?->format('Y-m-d'),
            '_deleted' => $book->_deleted,
            'created_at' => $book->created_at,
            'updated_at' => $book->updated_at,
        ];
    }

    private function coverImageUrl(
        Book $book,
        Request $request
    ): ?string {
        if (!$book->cover_image) {
            return null;
        }

        if (str_starts_with($book->cover_image, 'http')) {
            return $book->cover_image;
        }

        return $request->getSchemeAndHttpHost()
            . '/storage/'
            . ltrim($book->cover_image, '/');
    }

    private function deleteCoverImage(?string $path): void
    {
        if (
            $path &&
            !str_starts_with($path, 'http')
        ) {
            Storage::disk('public')->delete($path);
        }
    }
}

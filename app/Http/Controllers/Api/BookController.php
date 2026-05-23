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
        $perPage = min(max((int) $request->query('per_page', 10), 1), 100);
        $search = trim((string) $request->query('search', ''));

        $books = Book::query()
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

        return $this->successResponse('Books fetched successfully', [
            'current_page' => $books->currentPage(),
            'per_page' => $books->perPage(),
            'total' => $books->total(),
            'last_page' => $books->lastPage(),
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make(
            $request->all(),
            $this->storeRules(),
            $this->messages()
        );

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        $book = Book::create($data);

        return $this->successResponse(
            'Book created successfully',
            $this->bookValue($book, $request),
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $book = Book::find($id);

        if (!$book) {
            return $this->errorResponse('Book not found', null, 404);
        }

        return $this->successResponse(
            'Book fetched successfully',
            $this->bookValue($book, $request)
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $book = Book::find($id);

        if (!$book) {
            return $this->errorResponse('Book not found', null, 404);
        }

        $validator = Validator::make(
            $request->all(),
            $this->updateRules(),
            $this->messages()
        );

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('cover_image')) {

            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }

            $data['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        $book->update($data);

        return $this->successResponse(
            'Book updated successfully',
            $this->bookValue($book->fresh(), $request)
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $book = Book::find($id);

        if (!$book) {
            return $this->errorResponse('Book not found', null, 404);
        }

        if ($book->cover_image) {
            Storage::disk('public')->delete($book->cover_image);
        }

        $book->delete();

        return $this->successResponse('Book deleted successfully', null);
    }

    private function storeRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price' => 'required|numeric|min:0',
            'published_date' => 'nullable|date',
        ];
    }

    private function updateRules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'cover_image' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price' => 'sometimes|required|numeric|min:0',
            'published_date' => 'sometimes|date',
        ];
    }

    private function messages(): array
    {
        return [
            'cover_image.image' => 'Cover image must be valid image',
            'cover_image.mimes' => 'Allowed formats: jpg, jpeg, png, webp',
            'cover_image.max' => 'Image must be under 2MB',
        ];
    }

    private function bookValue(Book $book, Request $request): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'cover_image' => $book->cover_image,
            'cover_image_url' => $book->cover_image
                ? $request->getSchemeAndHttpHost() . '/storage/' . $book->cover_image
                : null,
            'price' => $book->price,
            'published_date' => $book->published_date?->format('Y-m-d'),
            'created_at' => $book->created_at,
            'updated_at' => $book->updated_at,
        ];
    }
}
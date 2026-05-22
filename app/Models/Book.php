<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'cover_image',
        'price',
        'published_date',
        '_deleted',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'published_date' => 'date',
            '_deleted' => 'boolean',
        ];
    }
}

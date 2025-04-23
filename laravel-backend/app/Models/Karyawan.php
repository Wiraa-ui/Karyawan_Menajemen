<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Karyawan extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'nama',
        'username',
        'password',
        'unit_id',
        'tanggal_bergabung'
    ];

    protected $hidden = [
        'password',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function jabatans()
    {
        return $this->belongsToMany(Jabatan::class, 'jabatan_karyawan', 'karyawan_id', 'jabatan_id');
    }

    public function logins()
    {
        return $this->hasMany(Login::class);
    }
}

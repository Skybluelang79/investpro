<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $wallet = $this->walletService->getOrCreate($request->user()->id);

        return response()->json(['wallet' => $wallet]);
    }
}

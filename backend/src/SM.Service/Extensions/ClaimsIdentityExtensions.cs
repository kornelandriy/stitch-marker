﻿using System.Linq;
using System.Security.Claims;

namespace SM.Service.Extensions
{
    public static class ClaimsIdentityExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        }
    }
}

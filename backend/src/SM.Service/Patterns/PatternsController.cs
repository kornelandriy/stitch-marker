﻿using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Proto.Cluster;
using SM.Core.Model;
using SM.Service.Classes;

namespace SM.Service.Patterns
{
    [Route("api/[controller]")]
    public class PatternsController : Controller
    {
        [Route("{patternId}")]
        public async Task<IActionResult> Get(Guid patternId)
        {
            var pattern = await Cluster.GetAsync($"pattern-{patternId}", "pattern");
            var request = await pattern.RequestAsync<PatternState>(new PatternQuery());
            return Ok(request);
        }

        public async Task<IActionResult> Post(IFormFile file)
        {
            var patternId = Guid.NewGuid().ToString();
            var pattern = await Cluster.GetAsync($"pattern-{patternId}", "pattern");
            var content = await file.ReadAllBytes();
            var command = new CreatePattern(file.FileName, content);
            var info = await pattern.RequestAsync<PatternBasicInfo>(command);
            return Created(patternId, info);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Jimmy_Waern_Assignment1.Models;
using System.IO;
using System.Text.RegularExpressions;

namespace Jimmy_Waern_Assignment1.Controllers
{
    [Route("api/customer")]
    public class CustomerController : Controller
    {
        private readonly CustomerContext _context;

        public CustomerController(CustomerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IEnumerable<Customer> GetAllCustomers()
        {
            return _context.Customers.OrderBy(c => c.Id).ToList();
        }

        [HttpGet, Route("{id}")]
        public IActionResult GetCustomer(int id)
        {
            var customer = _context.Customers.FirstOrDefault(t => t.Id == id);

            if (customer == null)
            {
                return NotFound();
            }

            return Ok(customer);
        }

        [HttpPost]
        public IActionResult CreateCustomer(Customer customer)
        {
            Regex emailFormat = new Regex(@"^[^@]+@[^@]+\.[^@]+$");
            if (customer.FirstName == null || customer.LastName == null || customer.Age <= 0 || customer.Age > 140)
            {
                return BadRequest("Ange information.");
            }
            else if (!emailFormat.Match(customer.Email).Success)
            {
                return BadRequest("Fel format.");
            }
            customer.Created = DateTime.Now.ToString("yyyy-MM-dd");
            _context.Customers.Add(customer);
            _context.SaveChanges();
            return Ok(customer.LastName);
        }

        [HttpPut]
        public IActionResult EditCustomer(Customer customer)
        {
            Regex emailFormat = new Regex(@"^[^@]+@[^@]+\.[^@]+$");
            if (customer.FirstName == null || customer.LastName == null || customer.Age <= 0 || customer.Age > 140)
            {
                return BadRequest("Ange information.");
            }
            else if (!emailFormat.Match(customer.Email).Success)
            {
                return BadRequest("Fel format.");
            }

            var existingCustomer = _context.Customers.FirstOrDefault(t => t.Id == customer.Id);
            if (existingCustomer == null)
            {
                return NotFound();
            }

            existingCustomer.FirstName = customer.FirstName;
            existingCustomer.LastName = customer.LastName;
            existingCustomer.Email = customer.Email;
            existingCustomer.Gender = customer.Gender;
            existingCustomer.Age = customer.Age;
            existingCustomer.Edited = DateTime.Now.ToString("yyyy-MM-dd");

            _context.Customers.Update(existingCustomer);
            _context.SaveChanges();
            return Ok();
        }

        [HttpDelete]
        public IActionResult RemoveCustomer(int id)
        {
            var customer = _context.Customers.FirstOrDefault(t => t.Id == id);
            if (customer == null)
            {
                return NotFound();
            }

            _context.Customers.Remove(customer);
            _context.SaveChanges();
            return Ok();
        }

        [HttpGet("getlog")]
        public IActionResult GetLog()
        {
            var file = Path.Combine(Environment.CurrentDirectory, "data", "log.txt");
            var log = System.IO.File.ReadAllLines(file);
            return Ok(log);
        }

        [HttpPost("savelog")]
        public IActionResult SaveLog(string log)
        {
            var file = Path.Combine(Environment.CurrentDirectory, "data", "log.txt");
            var entry = String.Format("[{0}] {1}\n", DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss"), log);
            System.IO.File.AppendAllText(file, entry);
            return Ok();
        }

        [HttpGet, Route("seed")]
        public IActionResult Seed()
        {
            _context.Customers.RemoveRange(_context.Customers);
            var file = Path.Combine(Environment.CurrentDirectory, "data", "Seed.csv");
            using (var streamReader = System.IO.File.OpenText(file))
            {
                while (!streamReader.EndOfStream)
                {
                    var data = streamReader.ReadLine().Trim().Split(",");
                    var customer = new Customer()
                    {
                        FirstName = data[1],
                        LastName = data[2],
                        Email = data[3],
                        Gender = data[4],
                        Age = int.Parse(data[5]),
                        Created = DateTime.Now.ToString("yyyy-MM-dd")
                    };
                    _context.Add(customer);
                }
                _context.SaveChanges();
            }
            return Ok();
        }
    }
}

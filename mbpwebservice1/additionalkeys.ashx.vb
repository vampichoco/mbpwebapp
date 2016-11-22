Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization
Imports System.Linq.Dynamic

Public Class additionalkeys
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim db As New mbpDataContext

        Dim q = From ca In db.clavesadds
                Select New With {
                    .Clave = ca.Clave,
                    .Articulo = ca.Articulo,
                    .Precio = ca.Precio,
                    .Cantidad = ca.Cantidad,
                    .Desc = ca.Dato1,
                    .U = GetUniqueID(Guid.NewGuid())
                    }

        Dim json As New JavaScriptSerializer

        context.Response.Write(json.Serialize(q))

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

    Function GetUniqueID(ByVal guid As Guid) As String
        Dim bytes = guid.ToByteArray()

        Dim uniqueStr = Convert.ToBase64String(bytes)
        uniqueStr = uniqueStr.Replace("/", "_").Replace("+", "-").Replace("=", "")

        Return uniqueStr


    End Function

End Class

